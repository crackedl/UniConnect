package com.uniconnect.storage;

import com.uniconnect.exception.StorageException;
import com.uniconnect.service.StorageService;

import java.io.*;
import java.io.Serializable;
import java.util.Collections;
import java.util.List;

public class ObjectStreamStorageService<T extends Serializable> implements StorageService<T> {

    @Override
    public void saveToJson(List<T> items, String filePath) {
        throw new UnsupportedOperationException("Use JsonStorageService for this");
    }

    @Override
    public List<T> loadFromJson(String filePath) {
        throw new UnsupportedOperationException("Use JsonStorageService for this");
    }

    @Override
    public void saveToObjectStream(List<T> items, String filePath) {
        try (ObjectOutputStream oos = new ObjectOutputStream(
                new FileOutputStream(filePath))) {
            oos.writeObject(items);
        } catch (FileNotFoundException e) {
            throw new StorageException("File not found: " + filePath, e);
        } catch (IOException e) {
            throw new StorageException("I/O error while writing object stream", e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<T> loadFromObjectStream(String filePath) {
        File file = new File(filePath);
        if (!file.exists()) {
            return Collections.emptyList();
        }
        try (ObjectInputStream ois = new ObjectInputStream(
                new FileInputStream(file))) {
            return (List<T>) ois.readObject();
        } catch (FileNotFoundException e) {
            throw new StorageException("File not found: " + filePath, e);
        } catch (IOException | ClassNotFoundException e) {
            throw new StorageException("Error reading object stream", e);
        }
    }
}
