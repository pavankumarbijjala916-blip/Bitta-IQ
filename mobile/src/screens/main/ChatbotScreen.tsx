import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
}

const ChatbotScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! 👋 I\'m your Battery Assistant. How can I help you today?',
      isBot: true,
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Math.random().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')

    // Simulate bot response
    setIsLoading(true)
    setTimeout(() => {
      const botMessage: Message = {
        id: Math.random().toString(),
        text: getBotResponse(inputText),
        isBot: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setIsLoading(false)
    }, 800)
  }

  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes('health') || lowerInput.includes('status')) {
      return 'To check your battery health, go to the Monitor tab and tap on a battery to see detailed health information and recommendations.'
    }
    if (lowerInput.includes('temperature')) {
      return 'Temperature is a key factor in battery health. Keep your batteries between 15-25°C for optimal performance. High temperatures can accelerate degradation.'
    }
    if (lowerInput.includes('cycle') || lowerInput.includes('charge')) {
      return 'Charge cycles indicate how many times a battery has been fully charged and discharged. Fewer cycles mean better battery health. Most batteries last 500-1000 cycles.'
    }
    if (lowerInput.includes('recycle') || lowerInput.includes('disposal')) {
      return 'For proper battery disposal, contact your local e-waste recycling center. Many batteries contain valuable materials that can be recovered and reused.'
    }
    if (lowerInput.includes('poor')) {
      return 'A poor health battery should be replaced soon. Continuing to use a severely degraded battery may result in performance issues or safety hazards.'
    }
    if (lowerInput.includes('register')) {
      return 'To register a battery, go to the Monitor tab and tap "Add New Battery". Enter your battery specifications like voltage, temperature, and charge cycles.'
    }
    return 'I can help you with battery health monitoring, disposal recommendations, and system features. Feel free to ask about specific batteries or general battery care tips!'
  }

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageRow, { justifyContent: item.isBot ? 'flex-start' : 'flex-end' }]}>
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: item.isBot ? '#f3f4f6' : '#10b981'
          }
        ]}
      >
        <Text
          style={[
            styles.messageText,
            {
              color: item.isBot ? '#1f2937' : '#fff'
            }
          ]}
        >
          {item.text}
        </Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.botAvatar}>
              <Icon name="robot" size={24} color="#10b981" />
            </View>
            <View>
              <Text style={styles.botName}>Battery Assistant</Text>
              <Text style={styles.botStatus}>Always online</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesContainer}
          scrollEnabled={true}
        />

        {isLoading && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ask about battery health, disposal, etc..."
              placeholderTextColor="#9ca3af"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Icon name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.disclaimer}>
            ⓘ I'm an AI assistant. For critical battery issues, consult professional advice.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  flex: {
    flex: 1
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb'
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  botName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937'
  },
  botStatus: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 2
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexGrow: 1,
    justifyContent: 'flex-end'
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderBottomLeftRadius: 0
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 4
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db'
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    gap: 8
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1f2937',
    maxHeight: 100
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonDisabled: {
    opacity: 0.5
  },
  disclaimer: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center'
  }
})

export default ChatbotScreen
