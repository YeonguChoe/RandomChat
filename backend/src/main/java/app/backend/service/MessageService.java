package app.backend.service;

import java.io.FileWriter;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import app.backend.model.Message;

@Service
public class MessageService {

        @Value("${history-csv.file}")
        private String FILE_PATH;

        public synchronized void saveMessage(String from, String to, String date, String time, String content)
                        throws Exception {
                Message message = new Message(from, to, date, time, content);
                FileWriter writer = new FileWriter(FILE_PATH, true);
                CSVFormat csvFormat = CSVFormat.Builder.create()
                                .setRecordSeparator("\n")
                                .build();
                CSVPrinter csvPrinter = new CSVPrinter(writer, csvFormat);
                csvPrinter.printRecord(message.getFrom(), message.getTo(), message.getDate(), message.getTime(),
                                message.getContent());
                csvPrinter.flush();
        }

}
