import React, { useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface AutoCompleteInputProps<T> {
  data: T[];
  displayKey: string;
  placeholder: string;
  onSelect: (item: T) => void;
  filterFunction?: (item: T, query: string) => boolean;
}

export function AutoCompleteInput<T extends Record<string, any>>({
  data,
  displayKey,
  placeholder,
  onSelect,
  filterFunction,
}: AutoCompleteInputProps<T>) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredData, setFilteredData] = useState<T[]>([]);

  const handleTextChange = (text: string) => {
    setQuery(text);

    console.log('AutoComplete - Texto:', text, '| Data length:', data.length);

    if (text.trim() === '') {
      setFilteredData([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = data.filter((item) => {
      if (filterFunction) {
        return filterFunction(item, text);
      }
      
      const value = item[displayKey]?.toString().toLowerCase() || '';
      return value.includes(text.toLowerCase());
    });

    console.log('AutoComplete - Filtrados:', filtered.length);
    setFilteredData(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  const handleSelectItem = (item: T) => {
    setQuery(item[displayKey]);
    setShowSuggestions(false);
    onSelect(item);
  };

  const renderItem = ({ item }: { item: T }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectItem(item)}
    >
      <Text style={styles.suggestionText}>{item[displayKey]}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor="#999"
        onFocus={() => query && setShowSuggestions(filteredData.length > 0)}
        autoCorrect={false}
        autoCapitalize="none"
      />

      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={(_item: T, index: number) => index.toString()}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 6,
    zIndex: 1001,
  },
  suggestionsList: {
    borderRadius: 8,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
});
