package com.example.demo.controller;

import com.example.demo.model.ScanRecord;
import com.example.demo.service.ScanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

    @RestController
    @RequestMapping("/api/security")
    @CrossOrigin(origins = "*")
    public class ScanController {

        @Autowired
        private ScanService scanService;

        @PostMapping("/scan")
        public ResponseEntity<?> uploadAndScan(@RequestParam("file") MultipartFile file) {
            if (file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("File is empty.");
            }

            try {
                ScanRecord record = scanService.scanAndSave(file);
                return ResponseEntity.ok(record);
            } catch (Exception e) {
                e.printStackTrace();

                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error processing file: " + e.getMessage());
            }
        }
    }

