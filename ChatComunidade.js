import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { db } from './firebaseConfig'; // Certifique-se de que o caminho para o firebaseConfig esteja correto
import { getAuth } from 'firebase/auth';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

// Tela de ChatComunidade
const ChatComunidade = ({ route, navigation }) => {
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');

  const { comunidadeId } = route.params; // ID da comunidade (passado como parâmetro)

  // Função para enviar mensagens
  const enviarMensagem = async () => {
    if (!mensagem.trim()) {
      setError('Por favor, insira uma mensagem');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = getAuth().currentUser;

      // Adicionar mensagem à coleção de mensagens do Firestore
      await addDoc(collection(db, 'comunidades', comunidadeId, 'mensagens'), {
        texto: mensagem,
        remetente: user.displayName || 'Usuário',
        timestamp: new Date(),
      });

      setMensagem('');
    } catch (e) {
      console.error('Erro ao enviar mensagem:', e);
      setError('Ocorreu um erro ao enviar a mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar mensagens em tempo real
  const carregarMensagens = useCallback(() => {
    const q = query(
      collection(db, 'comunidades', comunidadeId, 'mensagens'),
      orderBy('timestamp', 'asc')
    );

    // Atualiza as mensagens em tempo real
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const mensagens = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(mensagens);
    });

    return () => unsubscribe(); // Limpa a escuta ao sair da tela
  }, [comunidadeId]);

  useEffect(() => {
    carregarMensagens();
  }, [carregarMensagens]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat da Comunidade</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.sender}>{item.remetente}:</Text>
            <Text style={styles.message}>{item.texto}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma mensagem"
          placeholderTextColor="#aaa"
          value={mensagem}
          onChangeText={setMensagem}
        />
        <TouchableOpacity style={styles.sendButton} onPress={enviarMensagem} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendButtonText}>Enviar</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: '#f00',
    textAlign: 'center',
    marginBottom: 15,
  },
  messagesList: {
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 15,
  },
  sender: {
    fontWeight: 'bold',
    color: '#fff',
  },
  message: {
    color: '#aaa',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  sendButton: {
    backgroundColor: '#9F3EFC',
    padding: 15,
    borderRadius: 10,
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatComunidade;
