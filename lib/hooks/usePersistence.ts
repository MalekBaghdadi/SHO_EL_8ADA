"use client";

import { useState, useEffect } from "react";

const STORAGE_KEYS = {
    FAVORITES: "sho_el_8ada_favorites",
    HISTORY: "sho_el_8ada_history",
    SETTINGS: "sho_el_8ada_settings",
};

export interface Settings {
    persistentExcludedTags: string[];
}

export function usePersistence() {
    const [favorites, setFavorites] = useState<number[]>([]);
    const [history, setHistory] = useState<number[]>([]);
    const [settings, setSettings] = useState<Settings>({ persistentExcludedTags: [] });
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const savedFavs = localStorage.getItem(STORAGE_KEYS.FAVORITES);
        const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
        const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

        if (savedFavs) setFavorites(JSON.parse(savedFavs));
        if (savedHistory) setHistory(JSON.parse(savedHistory));
        if (savedSettings) setSettings(JSON.parse(savedSettings));

        setIsLoaded(true);
    }, []);

    // Sync to localStorage
    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    }, [favorites, isLoaded]);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    }, [history, isLoaded]);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }, [settings, isLoaded]);

    const toggleFavorite = (id: number) => {
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    const addToHistory = (id: number) => {
        setHistory(prev => {
            const filtered = prev.filter(h => h !== id); // Remove existing to push to front
            const newer = [id, ...filtered];
            return newer.slice(0, 20); // Keep last 20
        });
    };

    const clearHistory = () => {
        setHistory([]);
    };

    const updateSettings = (newSettings: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return {
        favorites,
        history,
        settings,
        isLoaded,
        toggleFavorite,
        addToHistory,
        clearHistory,
        updateSettings,
    };
}
