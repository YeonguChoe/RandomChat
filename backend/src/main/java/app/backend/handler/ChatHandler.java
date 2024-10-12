package app.backend.handler;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import app.backend.service.MessageService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ChatHandler extends TextWebSocketHandler {

    ObjectMapper objectMapper = new ObjectMapper();
    private Logger logger = LoggerFactory.getLogger(ChatHandler.class);

    private ConcurrentLinkedQueue<WebSocketSession> waitingLine = new ConcurrentLinkedQueue<>();
    private ConcurrentHashMap<WebSocketSession, WebSocketSession> connectedPair = new ConcurrentHashMap<>();
    private ConcurrentHashMap<WebSocketSession, String> ipAddressBook = new ConcurrentHashMap<>();

    @Autowired
    private MessageService messageService;

    @Autowired
    public ChatHandler(MessageService messageService) {
        this.messageService = messageService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        waitingLine.add(session);
        String connectedToServerMessage = "{\"kind\": \"statusMessage\", \"status\": \"connectedToServer\"}";
        session.sendMessage(new TextMessage(connectedToServerMessage));

        if (waitingLine.size() >= 2) {
            WebSocketSession session1 = waitingLine.poll();
            WebSocketSession session2 = waitingLine.poll();

            connectedPair.put(session1, session2);
            connectedPair.put(session2, session1);

            String connectedToUserMessage = "{\"kind\": \"statusMessage\", \"status\": \"connectedToUser\"}";
            session1.sendMessage(new TextMessage(connectedToUserMessage));
            session2.sendMessage(new TextMessage(connectedToUserMessage));
        }

        String clientIp = (String) session.getAttributes().get("clientIP");
        ipAddressBook.put(session, clientIp);

        broadcastUserCount();
        logger.info(
                "Connected to new user " + "(Waitlist: " + waitingLine.size() + ", " + "Chatroom:" + connectedPair.size()
                        + ")");
    }

    @Override
    public synchronized void afterConnectionClosed(WebSocketSession closedSession, CloseStatus status)
            throws Exception {
        try {
            if (waitingLine.remove(closedSession)) {
                // The session was in the waiting line, no further action needed
            } else {
                WebSocketSession remainingSession = connectedPair.remove(closedSession);
                if (remainingSession != null) {
                    if (remainingSession.isOpen()) {
                        String disconnectedFromServerMessage = "{\"kind\": \"statusMessage\", \"status\": \"disconnectedFromServer\"}";
                        try {
                            remainingSession.sendMessage(new TextMessage(disconnectedFromServerMessage));
                            connectedPair.remove(remainingSession);
                            remainingSession.close();
                        } catch (IOException e) {
                            logger.error("Error sending message or closing remaining session", e);
                        }
                    } else {
                        connectedPair.remove(remainingSession);
                    }
                }
            }

            ipAddressBook.remove(closedSession);
            broadcastUserCount();
            logger.info("User left. (Remaning user: " + (waitingLine.size() + connectedPair.size()) + ")");
        } catch (IllegalStateException e) {
            // Log nothing and ignore the exception
        } catch (Exception e) {
            logger.error("Error during connection close handling", e);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            WebSocketSession connectedSession = connectedPair.get(session);

            if (connectedSession != null && session.isOpen() && connectedSession.isOpen()) {
                JsonNode jsonMessage = objectMapper.readTree(message.getPayload());
                String kind = jsonMessage.get("kind").asText();
                String sender = jsonMessage.get("sender").asText();
                String receiver = jsonMessage.get("receiver").asText();
                String messageContent = jsonMessage.get("messageContent").asText();

                if (kind.equals("clientMessage") && receiver.equals("server") && sender.equals("client")) {
                    ObjectNode newJsonMessage = objectMapper.createObjectNode();
                    newJsonMessage.put("kind", "serverMessage");
                    newJsonMessage.put("messageContent", messageContent);
                    newJsonMessage.put("receiver", "client");
                    newJsonMessage.put("sender", "server");

                    String newMessageString = objectMapper.writeValueAsString(newJsonMessage);

                    connectedSession.sendMessage(new TextMessage(newMessageString));

                    String from = ipAddressBook.get(session);
                    String to = ipAddressBook.get(connectedSession);
                    DateTimeFormatter dateFormatter = DateTimeFormatter.ISO_DATE;
                    DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");
                    String formattedDate = LocalDateTime.now().format(dateFormatter);
                    String formattedTime = LocalDateTime.now().format(timeFormatter);
                    messageService.saveMessage(from, to, formattedDate, formattedTime, messageContent);
                }
            } else {
                logger.warn("Message received from a session that is not connected or is closed.");
            }
        } catch (IllegalStateException e) {
        } catch (Exception e) {
            logger.error("Error while handling text message", e);
        }
    }

    private void broadcastUserCount() throws IOException {
        int totalUserCount = waitingLine.size() + connectedPair.size();
        String message = String.format("{\"kind\": \"userCount\", \"userCount\": %d}", totalUserCount);

        Set<WebSocketSession> matchedSessions = connectedPair.keySet();
        for (WebSocketSession session : matchedSessions) {
            try {
                session.sendMessage(new TextMessage(message));
            } catch (IllegalStateException e) {
            }
        }
        for (WebSocketSession waitingUser : waitingLine) {
            try {
                waitingUser.sendMessage(new TextMessage(message));
            } catch (IllegalStateException e) {
            }
        }
    }
}
