package com.uniconnect.service;

import java.util.List;

public interface StorageService<T> {

    void saveToJson(List<T> items, String filePath);

    List<T> loadFromJson(String filePath);

    void saveToObjectStream(List<T> items, String filePath);

    List<T> loadFromObjectStream(String filePath);
}
