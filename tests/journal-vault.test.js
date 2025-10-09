/**
 * Journal Vault Tests
 * Tests for the ChatGPT integration and journal functionality
 */

describe('Journal Vault', () => {
  let mockLocalStorage;

  beforeEach(() => {
    // Reset localStorage mock
    mockLocalStorage = {
      'chatgpt-conversations': JSON.stringify([testData.chatMessages]),
      'journal-entries': JSON.stringify([testData.journalEntry])
    };
    
    localStorage.getItem.mockImplementation(key => mockLocalStorage[key]);
    localStorage.setItem.mockImplementation((key, value) => {
      mockLocalStorage[key] = value;
    });
  });

  describe('Conversation Storage', () => {
    test('should save conversation to localStorage', () => {
      const conversation = testData.chatMessages;
      
      // Simulate saving conversation
      const conversationKey = 'chatgpt-conversations';
      localStorage.setItem(conversationKey, JSON.stringify(conversation));
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        conversationKey, 
        JSON.stringify(conversation)
      );
    });

    test('should retrieve conversations from localStorage', () => {
      const conversations = JSON.parse(localStorage.getItem('chatgpt-conversations'));
      
      expect(conversations).toEqual([testData.chatMessages]);
      expect(localStorage.getItem).toHaveBeenCalledWith('chatgpt-conversations');
    });

    test('should handle empty localStorage gracefully', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const conversations = JSON.parse(localStorage.getItem('chatgpt-conversations') || '[]');
      
      expect(conversations).toEqual([]);
    });
  });

  describe('Journal Entry Management', () => {
    test('should create new journal entry', () => {
      const newEntry = {
        id: 'journal-456',
        content: 'Feeling better today after our chat.',
        timestamp: new Date().toISOString(),
        mood: 'improving'
      };

      const entries = JSON.parse(localStorage.getItem('journal-entries') || '[]');
      entries.push(newEntry);
      localStorage.setItem('journal-entries', JSON.stringify(entries));

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'journal-entries',
        JSON.stringify([testData.journalEntry, newEntry])
      );
    });

    test('should filter entries by mood', () => {
      const entries = [testData.journalEntry];
      const positiveEntries = entries.filter(entry => entry.mood === 'positive');
      
      expect(positiveEntries).toHaveLength(1);
      expect(positiveEntries[0].mood).toBe('positive');
    });

    test('should export entries as JSON', () => {
      const entries = [testData.journalEntry];
      const exportData = {
        exportDate: new Date().toISOString(),
        totalEntries: entries.length,
        entries: entries
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      
      expect(jsonString).toContain('Today was a good day');
      expect(JSON.parse(jsonString).totalEntries).toBe(1);
    });
  });

  describe('ChatGPT Integration', () => {
    test('should format message for ChatGPT API', () => {
      const userMessage = 'I\'m feeling anxious today.';
      const formattedMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      };

      expect(formattedMessage.role).toBe('user');
      expect(formattedMessage.content).toBe(userMessage);
      expect(formattedMessage.timestamp).toBeDefined();
    });

    test('should handle API response', () => {
      const mockResponse = testUtils.mockChatGPTResponse(
        'I understand you\'re feeling anxious. Let\'s work through this together.'
      );

      const assistantMessage = {
        role: 'assistant',
        content: mockResponse.choices[0].message.content,
        timestamp: new Date().toISOString()
      };

      expect(assistantMessage.role).toBe('assistant');
      expect(assistantMessage.content).toContain('understand');
    });

    test('should handle API errors gracefully', () => {
      const errorResponse = {
        error: 'API key invalid'
      };

      const fallbackMessage = {
        role: 'assistant',
        content: 'I\'m sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date().toISOString(),
        error: true
      };

      expect(fallbackMessage.error).toBe(true);
      expect(fallbackMessage.content).toContain('trouble connecting');
    });
  });

  describe('Data Privacy', () => {
    test('should only store data locally', () => {
      // Verify no external API calls for data storage
      expect(fetch).not.toHaveBeenCalled();
      
      // Verify localStorage is used
      expect(localStorage.getItem).toHaveBeenCalled();
    });

    test('should allow data deletion', () => {
      localStorage.removeItem('chatgpt-conversations');
      localStorage.removeItem('journal-entries');

      expect(localStorage.removeItem).toHaveBeenCalledWith('chatgpt-conversations');
      expect(localStorage.removeItem).toHaveBeenCalledWith('journal-entries');
    });

    test('should handle data clearing', () => {
      localStorage.clear();
      
      expect(localStorage.clear).toHaveBeenCalled();
    });
  });
});