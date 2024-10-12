package app.backend.model;

public class Message {
    private String from;
    private String to;
    private String date;
    private String time;
    private String content;

    // 명시적인 생성자 추가
    public Message(String from, String to, String date, String time, String content) {
        this.from = from;
        this.to = to;
        this.date = date;
        this.time = time;
        this.content = content;
    }

    // Getter와 Setter 메소드 추가
    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
