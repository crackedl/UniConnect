package com.uniconnect.storage;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.uniconnect.exception.StorageException;
import com.uniconnect.service.StorageService;

import java.io.File;
import java.io.IOException;
import java.util.Collections;
import java.util.List;

public class JsonStorageService<T> implements StorageService<T> {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final TypeReference<List<T>> typeRef;

    public JsonStorageService(TypeReference<List<T>> typeRef) {
        this.typeRef = typeRef;
    }

    @Override
    public void saveToJson(List<T> items, String filePath) {
        try {
            objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValue(new File(filePath), items);
        } catch (IOException e) {
            throw new StorageException("Failed to save JSON", e);
        }
    }

    @Override
    public List<T> loadFromJson(String filePath) {
        try {
            File f = new File(filePath);
            if (!f.exists()) {
                return Collections.emptyList();
            }
            return objectMapper.readValue(f, typeRef);
        } catch (IOException e) {
            throw new StorageException("Failed to load JSON", e);
        }
    }

    @Override
    public void saveToObjectStream(List<T> items, String filePath) {
        throw new UnsupportedOperationException("Use ObjectStreamStorageService for this");
    }

    @Override
    public List<T> loadFromObjectStream(String filePath) {
        throw new UnsupportedOperationException("Use ObjectStreamStorageService for this");
    }
}
