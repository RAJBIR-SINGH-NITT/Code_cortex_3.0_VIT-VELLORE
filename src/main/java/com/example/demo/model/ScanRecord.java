package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

    @Document(collection = "scan_history")
    public class ScanRecord {

        @Id
        private String id;
        private String fileName;
        private String status;
        private double confidenceScore;
        private LocalDateTime scanTime;

        public ScanRecord() {}

        public ScanRecord(String fileName, String status, double confidenceScore, LocalDateTime scanTime) {
            this.fileName = fileName;
            this.status = status;
            this.confidenceScore = confidenceScore;
            this.scanTime = scanTime;
        }

        public String getId() { return id; }

        public String getFileName() { return fileName; }

        public void setFileName(String fileName) { this.fileName = fileName; }

        public String getStatus() { return status; }

        public void setStatus(String status) { this.status = status; }

        public double getConfidenceScore() { return confidenceScore; }

        public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }

        public LocalDateTime getScanTime() { return scanTime; }

        public void setScanTime(LocalDateTime scanTime) { this.scanTime = scanTime; }
    }

