package com.example.demo.repository;

import com.example.demo.model.ScanRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

    @Repository
    public interface ScanRecordRepository extends MongoRepository<ScanRecord, String> {
    }

