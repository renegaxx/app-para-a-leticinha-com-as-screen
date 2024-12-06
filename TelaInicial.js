import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Animated, ImageBackground, ScrollView, StatusBar, } from 'react-native';
import { auth, db } from './firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const TelaInicial = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(null);  // Novo estado para o avatar
  const [plan, setPlan] = useState(''); // Armazenar o plano do usuário
  const [buttonScale] = useState(new Animated.Value(1));

  const slideAnim = new Animated.Value(-500);

  //para o carrossel dos eventos
  const [activeTab, setActiveTab] = useState('', 'Para Você');
  const tabs = ['Para Você', 'Novos', 'Networking', 'Gostos', 'Eventos', 'Popular'];

  // Mapeamento de números de avatar para imagens
  const avatarImages = {
    1: require('./assets/avatares/1.jpg'),
    2: require('./assets/avatares/2.jpg'),
    3: require('./assets/avatares/3.jpg'),
    4: require('./assets/avatares/4.jpg'),
    5: require('./assets/avatares/5.jpg'),
    6: require('./assets/avatares/6.jpg'),
    7: require('./assets/avatares/7.jpg'),
    8: require('./assets/avatares/8.jpg'),
    9: require('./assets/avatares/9.jpg'),
    10: require('./assets/avatares/10.jpg'),
    11: require('./assets/avatares/11.jpg'),
  };

  // Imagem padrão se o avatar não existir
  const defaultAvatar = require('./assets/mcigPerfil.jpg');
// Função para renderizar o avatar do usuário
const renderAvatarImage = () => {
  // Verifica se o avatar existe no mapeamento, caso contrário, usa a imagem padrão
  return avatarImages[avatar] || defaultAvatar;
};

  // Condicionalmente, renderiza a imagem com base no plano
  const renderPlanImage = () => {
    if (plan === 'básico') {
      return <Image source={require('./assets/selos/básico.png')} style={styles.planImage} />;
    } else if (plan === 'premium') {
      return <Image source={require('./assets/selos/premium.png')} style={styles.planImage} />;
    } else if (plan === 'avançado') {
      return <Image source={require('./assets/selos/avançado.png')} style={styles.planImage} />;
    }
    return null; // Caso não haja plano ou plano desconhecido
  };

  // Monitorar o estado de autenticação do usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        getDoc(userRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              setFullName(userData.fullName);
              setUsername(userData.username);
              setEmail(userData.email);
              setPlan(userData.plano);
              setAvatar(userData.avatar);  // Define o avatar do usuário
            } else {
              console.log("Usuário não encontrado no Firestore");
            }
          })
          .catch((error) => {
            console.log("Erro ao recuperar dados do Firestore:", error);
          });
      } else {
        console.log("Usuário não está logado.");
      }
    });

    return () => unsubscribe();
  }, []);

  const handlePress = (tabName) => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveTab(tabName);
    });
  };

  const toggleContainer = () => {
    Animated.timing(slideAnim, {
      toValue: slideAnim._value === 0 ? -500 : 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        getDoc(userRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              setFullName(userData.fullName);
              setUsername(userData.username);
              setEmail(userData.email);
            } else {
              console.log("Usuário não encontrado no Firestore");
            }
          })
          .catch((error) => {
            console.log("Erro ao recuperar dados do Firestore:", error);
          });
      } else {
        console.log("Usuário não está logado.");
      }
    });

    return () => unsubscribe();
  }, []);

  const eventsData = [
    { id: '1', image: require('./assets/evento1.png'), title: 'Display Expo', description: '' },
    { id: '2', image: require('./assets/mcigPerfil.jpg'), title: 'Belo horz', description: '' },
    { id: '3', image: require('./assets/mcigPerfil.jpg'), title: 'Evento 3', description: '' },
    { id: '4', image: require('./assets/mcigPerfil.jpg'), title: 'Evento 4', description: '' },
    { id: '5', image: require('./assets/mcigPerfil.jpg'), title: 'Evento 5', description: '' },
    { id: '6', image: require('./assets/mcigPerfil.jpg'), title: 'Evento 6', description: '' },
    { id: '7', image: require('./assets/mcigPerfil.jpg'), title: 'Evento 7', description: '' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <Animated.View style={[styles.slideContainer, { transform: [{ translateY: slideAnim }] }]}>
        <ImageBackground
          source={require('./assets/gradienteBotao.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.slideCima}>
            <TouchableOpacity onPress={toggleContainer}>
              <Image source={renderAvatarImage()} style={styles.slidePerfil1} />
            </TouchableOpacity>
            <View style={styles.slideCimaLado}>

              <View style={styles.col}>
                <Text style={styles.col2}>32</Text>
                <Text style={styles.col3}>Colaboradores</Text>
              </View>

              <View style={styles.barra}></View>

              <View style={styles.col}>
                <Text style={styles.col2}>4</Text>
                <Text style={styles.col3}>Eventos</Text>
              </View>

            </View>
          </View>
          <View style={styles.slideNome}>
            <Text style={styles.slideNome2}>{fullName || 'Nome'}</Text>
            <View style={styles.planImage}>
              {renderPlanImage()} {/* Exibe a imagem se o plano for 'básico' */}
            </View>
          </View>
          <Text style={styles.slideUsername}>@{username || 'Usuário'}</Text>
          <Text style={styles.slideEmail}>{email || 'Email'}</Text>

          <View style={styles.slideBotoes}>
            <TouchableOpacity
              style={[styles.slideBotao, activeTab === 'Perfil' && styles.activeTab]}
              onPress={() => handlePress('Perfil')}
            >
              <Image
                source={require('./assets/icons/userImg.png')}
                style={[styles.slideIcon, activeTab === 'Perfil' && { tintColor: 'black' }]}
              />
              <Text style={[styles.slideTextBotao, activeTab === 'Perfil' && styles.activeTabText]}>
                Perfil
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.slideBotao, activeTab === 'MudarPlano' && styles.activeTab]}
              onPress={() => handlePress('MudarPlano')}
            >

              <Image
                source={require('./assets/icons/checkImg.png')}
                style={[styles.slideIcon, activeTab === 'MudarPlano' && { tintColor: 'black' }]}
              />
              <Text style={[styles.slideTextBotao, activeTab === 'MudarPlano' && styles.activeTabText]}>

                Plano
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.slideBotao, activeTab === 'MaisOpcoes' && styles.activeTab]}
              onPress={() => handlePress('MaisOpcoes')}
            >

              <Image
                source={require('./assets/icons/3pontosImg.png')}
                style={[styles.slideIcon3, activeTab === 'MaisOpcoes' && { tintColor: 'black' }]}
              />

            </TouchableOpacity>
          </View>
        </ImageBackground>
      </Animated.View>


      <View style={styles.cimas}>
        <View style={styles.bolaMenu2}>
          <TouchableOpacity onPress={toggleContainer}>
            <Image source={renderAvatarImage()}  style={styles.perfil1} />
          </TouchableOpacity>
        </View>

        <Text style={styles.textoCima}>
          Olá, {fullName || 'Usuário'}
        </Text>

        <View style={styles.bolaMenu}>
          <Image source={require('./assets/menuInicial.png')} style={styles.MenuInicial} />
        </View>
      </View>


      <View style={styles.eventsContainer}>


        <View style={styles.containerNetworking}>
          <Text style={styles.NetworkingEventos}>
            Eventos
          </Text>

          <View style={styles.botoesCarrol}>
            <ScrollView
              style={styles.scrollContainer}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.botaoCarrol,
                    activeTab === tab && styles.activeBotaoCarrol,
                  ]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    style={[
                      styles.botaoTexto,
                      activeTab === tab && styles.activeBotaoTexto,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

        </View>
        <FlatList
          data={eventsData}
          horizontal
          renderItem={({ item }) => (
            <View style={styles.eventItem}>
              <TouchableOpacity>
                <ImageBackground
                  source={item.image}
                  style={styles.eventImage}
                  resizeMode="cover"
                >

                  <View style={styles.baixoEventoText}>
                    <ImageBackground
                      source={require('./assets/gradienteCinza.png')}
                      style={styles.backgroundImage2}
                      resizeMode="cover"
                    >
                      <Text style={styles.eventTitle}>{item.title}</Text>
                      <Text style={styles.eventDescription}>{item.description}</Text>
                    </ImageBackground>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <View style={styles.codeButton}>
        <Image source={require('./assets/QRcodeImg.png')} style={styles.codeIcon} />

      </View>
      
        <Image source={require('./assets/eclipse1.png')} style={styles.backgroundImageColor} />

        
    </View >
  );
};
const styles = StyleSheet.create({
  backgroundImageColor: {
    position: 'absolute',
    width: 700, // Largura fixa
    height: '100%', // Altura total
    left: '50%', // Move para o centro
    transform: [{ translateX: -350 }], // Ajusta metade da largura para centralizar
    bottom: 400,
    

  },
  container: {

    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  header: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    height: 50,
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    zIndex: 1
  },
  cimas: {
    zIndex: 2,

    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 30,
    marginTop: 35,
  },
  bolaMenu: {
    width: 40,
    height: 40,
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    borderWidth: 0.5,
    
  },
  bolaMenu2: {
    width: 40,
    height: 40,
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 'auto',
  },
  perfil1: {
    width: 35,
    height: 35,
    resizeMode: 'cover',
    borderRadius: 100,
  },
  botaoMarca: {
    width: 25,
    height: 25,
    resizeMode: 'cover',
  },
  MenuInicial: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
  textoCima: {
    fontSize: 14,
    fontFamily: 'Raleway-SemiBold',
    color: 'white',
    marginLeft: 10,
  },




  containerNetworking: {
    zIndex: 1,
    flexDirection: 'row',
    width: '100%',
    
    marginLeft: 'auto',
    paddingHorizontal: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  scrollContainer: {
    borderRadius: 20,
    zIndex: 2,
    marginLeft: 'auto',

  },
  botoesCarrol: {
    flexDirection: 'row',
    marginLeft: 20,
  },
  botaoCarrol: {
    color: '#fff',
    marginHorizontal: 5,

    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  activeBotaoCarrol: {
    backgroundColor: '#fff', // Cor de fundo branca para o botão ativo
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
  activeBotaoTexto: {
    color: '#000', // Cor do texto preto para o botão ativo
  },

  NetworkingEventos: {
    color: '#fff',
    fontFamily: 'Raleway-Bold',
    fontSize: 28,

  },


  eventsContainer: {
    marginTop: 10,
    width: '100%',
    zIndex: 2
  },
  eventItem: {
    marginTop: 25,
    marginHorizontal: 10
  },
  baixoEventoText: {
    marginTop: 'auto'

  },
  eventImage: {
    width: 145,
    height: 275,
    borderRadius: 30,
    resizeMode: 'cover',
    overflow: 'hidden',

  },

  eventTitle: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Manrope-Bold',
    marginTop: 5,
    textAlign: 'center',
  },
  eventDescription: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Raleway-Regular',
    textAlign: 'center',
    marginTop: 3,
  },

  codeIcon: {
    width: 30,
    height: 30,
    tintColor: '#fff'
  },
  codeButton: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderWidth: 0.5,
    borderColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  escreverTexto: {
    color: 'white',
    fontSize: 11,
    fontFamily: 'Raleway-SemiBold',
    marginLeft: 10,
  },
  escreverTexto2: {
    color: 'black',
    fontSize: 11,
    fontFamily: 'Raleway-Bold',
    marginLeft: 10,
  },

  slideContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    overflow: 'hidden',
    backgroundColor: '#624199'

  },
  slideNome: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  slideNome2: {
    color: 'white',
    fontFamily: 'Raleway-Bold',
    fontSize: 30,
    alignItems: 'center'
  },
  planImage: {
    width: 25,
    height: 25,
    // Para deixar um espaço entre o nome e a imagem
    marginLeft: 2,
    marginTop: 2,
  },
  slideUsername: {
    color: '#f1f1f1'
  },
  slideEmail: {
    color: '#f1f1f1'
  },
  slidePerfil1: {
    width: 60,
    height: 60,
    resizeMode: 'cover',
    borderRadius: 100,
  },
  slideCima: {
    flexDirection: 'row',
  },
  slideCimaLado: {
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',

  },
  col2: {
    fontFamily: 'Montserrat-Bold',
    color: '#fff',
    fontSize: 20,
  },
  col3: {
    color: '#f1f1f1',
    fontFamily: 'Raleway-Regular',

  },

  barra: {
    height: 40,
    width: 0.5,
    backgroundColor: '#fff',
    marginHorizontal: 20,

  },
  slideBotoes: {
    flexDirection: 'row',
    width: '100%',
    paddingRight: 20,

    marginTop: 20,
  },
  slideBotao: {
    flexDirection: 'row', // Garante que o ícone e o texto fiquem lado a lado
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Cor padrão
    alignItems: 'center', // Alinha os itens no centro verticalmente
    justifyContent: 'center', // Alinha os itens horizontalmente
    textAlign: 'center',
    borderRadius: 50,
    margin: 5,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 1)', // Cor de fundo quando ativo
    flexDirection: 'row',
  },
  slideTextBotao: {
    fontSize: 14,
    color: 'white', // Cor do texto padrão
    fontFamily: 'Raleway-Bold',
    flexDirection: 'row'
  },
  activeTabText: {
    color: 'black', // Cor do texto quando ativo
    flexDirection: 'row',
  },
  slideIcon: {
    width: 20,
    height: 20,
    tintColor: 'white', // Cor padrão do ícone
    marginRight: 5
  },
  slideIcon3: {
    width: 25,
    height: 25,
    tintColor: 'white', // Cor padrão do ícone
  },
  backgroundImage: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,

  },
});

export default TelaInicial;
