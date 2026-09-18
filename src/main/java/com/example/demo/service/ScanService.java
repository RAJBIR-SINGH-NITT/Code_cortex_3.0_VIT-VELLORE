package com.example.demo.service;

import com.example.demo.model.ScanRecord;
import com.example.demo.repository.ScanRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Map;

@Service
    public class ScanService {

        @Autowired
        private ScanRecordRepository repository;


        private final String PYTHON_ML_URL = "http://127.0.0.1:5000/predict";

        public ScanRecord scanAndSave(MultipartFile file) throws Exception {
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.postForEntity(PYTHON_ML_URL, requestEntity, Map.class);

            Map<String, Object> responseBody = response.getBody();
            boolean isMalware = Boolean.parseBoolean(responseBody.get("malware").toString());
            double confidence = Double.parseDouble(responseBody.get("confidence").toString());

            String status = isMalware ? "MALWARE DETECTED" : "LEGITIMATE";

            ScanRecord record = new ScanRecord(
                    file.getOriginalFilename(),
                    status,
                    confidence,
                    LocalDateTime.now()
            );

            return repository.save(record);
        }
    }

