import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from './firebaseConfig';
import { getAuth } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CriarComunidade = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Função para selecionar imagem
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
  };

  // Função para salvar a comunidade no Firestore
  const salvarComunidade = async () => {
    if (!nome || !descricao) {
      setError('Preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = getAuth().currentUser;

      // Upload da imagem para o Firebase Storage
      let imagemUrl = null;
      if (imagem) {
        const response = await fetch(imagem);
        const blob = await response.blob();

        const imagemRef = ref(storage, `comunidades/${user.uid}_${Date.now()}`);
        const snapshot = await uploadBytes(imagemRef, blob);
        imagemUrl = await getDownloadURL(snapshot.ref);
      }

      // Salvar os dados no Firestore
      await addDoc(collection(db, 'comunidades'), {
        nome,
        descricao,
        imagem: imagemUrl,
        criador: user.uid,
        criacao: new Date(),
      });

      setNome('');
      setDescricao('');
      setImagem(null);
      navigation.goBack(); // Volta para a tela anterior
    } catch (e) {
      console.error('Erro ao salvar comunidade:', e);
      setError('Ocorreu um erro ao criar a comunidade. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Comunidade</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome da Comunidade"
        placeholderTextColor="#aaa"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descrição"
        placeholderTextColor="#aaa"
        value={descricao}
        onChangeText={setDescricao}
        multiline
      />

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imagem ? (
          <Image source={{ uri: imagem }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.imagePickerText}>Selecionar Imagem</Text>
        )}
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.saveButton} onPress={salvarComunidade} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Salvar</Text>}
      </TouchableOpacity>
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
  input: {
    height: 50,
    borderColor: '#fff',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 20,
    color: 'white',
    fontFamily: 'Raleway-Regular',
    marginBottom: 20,
    backgroundColor: 'transparent'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePicker: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#aaa',
    fontSize: 16,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: '#9F3EFC',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#f00',
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default CriarComunidade;
