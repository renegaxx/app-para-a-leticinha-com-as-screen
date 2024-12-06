import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, TouchableOpacity, Animated, ImageBackground, ScrollView, Modal } from 'react-native';
import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Para obter o usuário autenticado


// Dados dos eventos
const eventsData = [
    { id: '1', image: require('./assets/fotosEventos/evento1.jpg') },
    { id: '2', image: require('./assets/fotosEventos/evento2.jpg') },
    { id: '3', image: require('./assets/fotosEventos/evento3.jpg') },
    { id: '4', image: require('./assets/fotosEventos/evento4.jpg') },
    { id: '5', image: require('./assets/fotosEventos/evento5.jpg') },
    { id: '6', image: require('./assets/fotosEventos/evento6.jpg') },
    { id: '7', image: require('./assets/fotosEventos/evento7.jpg') },
    { id: '8', image: require('./assets/fotosEventos/evento8.jpg') },
    { id: '9', image: require('./assets/fotosEventos/evento9.jpg') },
    { id: '10', image: require('./assets/fotosEventos/evento10.jpg') },
];


const formatData = (data) => {
    if (typeof data === 'string') {
        // Dividir a data no formato 'DD-MM-YYYY'
        const partes = data.split('-');
        if (partes.length === 3) {
            const dia = partes[0]; // Dia
            const mes = partes[1]; // Mês
            const ano = partes[2]; // Ano

            // Array de meses em português
            const meses = [
                'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
            ];

            // Retorna a data no formato 'DD Mês Abreviado YYYY'
            return `${dia} ${meses[parseInt(mes) - 1]} ${ano}`;
        }
    }
    return 'Data inválida'; // Caso a string não tenha o formato esperado
};
// Função para buscar o nome completo do usuário
const fetchUserFullName = async (userId) => {
    try {
        const userDoc = doc(db, 'users', userId); // Supondo que você tenha uma coleção 'users'
        const userSnap = await getDoc(userDoc);
        if (userSnap.exists()) {
            const userData = userSnap.data();
            return userData.fullName || 'Nome não disponível'; // Retorna o fullName ou uma string padrão
        } else {
            return 'Nome não disponível';
        }
    } catch (error) {
        console.error('Erro ao buscar nome do usuário:', error);
        return 'Nome não disponível';
    }
};





// Função para mapear imagens com base no ID
const mapImageById = (id) => {
    const event = eventsData.find((e) => e.id === id);
    return event ? event.image : null; // Retorna a imagem ou null caso não encontre
};

const EventoScreen = ({ route, }) => {
    const { eventId } = route.params; // Pegando o ID do evento passado pela navegação
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [gostos, setGostos] = useState([]);
    const [gostoSelecionado, setGostoSelecionado] = useState('');
    const [liked, setLiked] = useState(false);  // Estado para o botão de "gostar"
    const [disliked, setDisliked] = useState(false);  // Estado para o botão de "desativado"
    const [modalVisible, setModalVisible] = useState(false);

    // Animações
    const imageAnim = useRef(new Animated.Value(1)).current; // Animação de opacidade para imagem
    
    const scrollY = new Animated.Value(0);  // Valor animado para o scroll Y


    const handleGarantirTicket = () => {
        setModalVisible(true); // Exibir o modal ao pressionar "Garantir Ticket"
    };

    const handlePagar = () => {
        console.log('Processando pagamento...');
        setModalVisible(false); // Fechar o modal após clicar em Pagar
        // Aqui você pode adicionar a lógica de pagamento real, como redirecionamento ou integração com API de pagamento
    };

    const handleCancelar = () => {
        setModalVisible(false); // Fechar o modal ao clicar em Cancelar
    };


    // Função para buscar os gostos no Firestore
    const fetchGostos = async () => {
        try {
            const gostosDoc = doc(db, 'eventos', eventId, 'gostos', 'lista'); // Supondo que gostos sejam armazenados assim
            const gostosSnap = await getDoc(gostosDoc);
            if (gostosSnap.exists()) {
                const gostosData = gostosSnap.data();
                setGostos(gostosData.lista); // Atualiza o estado de gostos com a lista recebida
            } else {
                setGostos([]); // Nenhum gosto encontrado
            }
        } catch (error) {
            console.error('Erro ao buscar gostos:', error);
        }
    };

    useEffect(() => {
        if (eventId) {
            fetchEvent();
            fetchGostos();  // Busca também os gostos
        }
    }, [eventId]);
    // Função para buscar o evento no Firestore
    const fetchEvent = async () => {
        try {
            const eventDoc = doc(db, 'eventos', eventId);
            const eventSnap = await getDoc(eventDoc);
            if (eventSnap.exists()) {
                const eventData = eventSnap.data();
                setEvent(eventData);
            } else {
                setEvent(null); // Evento não encontrado
            }
        } catch (error) {
            console.error('Erro ao buscar evento:', error);
            setEvent(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eventId) {
            fetchEvent();
        }
    }, [eventId]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    if (!event) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Evento não encontrado.</Text>
            </View>
        );
    }

    

    return (
        <ImageBackground
            source={mapImageById(event.imagemSelecionada)} // Sua imagem de fundo
            style={styles.container} // Estilo do container para garantir que a imagem ocupe toda a tela
            resizeMode="cover" // Ajuste o modo de exibição da imagem (cover, contain, etc.)
        >
            <ImageBackground
                source={require('./assets/cinzinhaBack.png')} // Sua imagem de fundo
                style={styles.container2} // Estilo do container para garantir que a imagem ocupe toda a tela
                resizeMode="cover" // Ajuste o modo de exibição da imagem (cover, contain, etc.)
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <Animated.View
                        style={[styles.eventImageContainer, { transform: [{ scale: imageAnim }] }]}
                    >
                    </Animated.View>
                    <View styles={styles.tudoContainer}>
                        <Image
                            source={mapImageById(event.imagemSelecionada)}
                            style={styles.imageEvent}
                        />
                        <View style={styles.cimaInfo}>
                            <Text style={styles.eventTitle}>
                                {event.titulo}
                            </Text>
                            <Text style={styles.eventPreco}>
                                R$ {event.preco ? parseFloat(event.preco).toFixed(2) : '0.00'}
                            </Text>
                        </View>
                        <Text style={styles.eventSubTitle}>{event.gosto}</Text>
                        <View style={styles.containerDescription}>
                            <View style={styles.containerBotaoDescription}>
                                <View style={styles.botaoDescription}>
                                    <Image style={styles.imgBotao} source={require('./assets/icons/estrelaImg.png')}></Image>
                                    <Text style={styles.textBotaoDescription}>4.5</Text>

                                </View>
                                <View style={styles.botaoDescription}>
                                    <Image style={styles.imgBotao} source={require('./assets/icons/olhoImg.png')}></Image>
                                    <Text style={styles.textBotaoDescription}>10K</Text>
                                </View>
                                <View style={styles.botaoDescription}>
                                    <Image style={styles.imgBotao} source={require('./assets/icons/olhoImg.png')}></Image>
                                    <Text style={styles.textBotaoDescription}>
                                        {event.dataEvento ? formatData(event.dataEvento) : 'Data não disponível'}
                                    </Text>

                                </View>
                            </View>
                            <Text style={styles.eventDescription}>{event.descricao}</Text>
                            <View style={styles.gostosContainer}>
                                {gostos.map((gosto, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.gostoItem, gostoSelecionado === gosto && styles.gostoSelected]}
                                        onPress={() => setGostoSelecionado(gosto)}
                                    >
                                        <Text style={styles.gostoText}>{gosto}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <View style={styles.botoes}>
                                {/* Botão "Gostar" */}
                                <TouchableOpacity
                                    style={[
                                        styles.botao,
                                        liked && { borderColor: 'red' }, // Se "liked" for true, muda a borda para vermelho
                                    ]}
                                    onPress={() => setLiked(!liked)} // Alterna o estado de "liked"
                                >
                                    <Image
                                        source={require('./assets/icons/gostarImg.png')}
                                        style={[
                                            styles.gostar,
                                            { tintColor: liked ? 'red' : '#fff' }, // Muda a cor do ícone para vermelho se "liked" for true
                                        ]}
                                    />
                                </TouchableOpacity>

                                {/* Botão "Desgostar" */}
                                <TouchableOpacity
                                    style={[
                                        styles.botao,
                                        disliked && { borderColor: 'yellow' }, // Se "disliked" for true, muda a borda para amarelo
                                    ]}
                                    onPress={() => setDisliked(!disliked)} // Alterna o estado de "disliked"
                                >
                                    <Image
                                        source={require('./assets/icons/desativadoImg.png')}
                                        style={[
                                            styles.gostar,
                                            { tintColor: disliked ? 'yellow' : '#fff' }, // Muda a cor do ícone para amarelo se "disliked" for true
                                        ]}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.outrasText}>Outras Informações</Text>
                    <View style={styles.outrasInformacoes}>
                        <View style={styles.seguuura}>
                            <View style={styles.containerOutrasText}>
                                <Image style={styles.iconOutras} source={require('./assets/icons/localImg.png')}></Image>
                                <Text style={styles.outrasText2}>
                                    {event.localizacao}
                                </Text>
                            </View>
                            <View style={styles.containerOutrasText}>
                                <Image style={styles.iconOutras} source={require('./assets/icons/clockImg.png')}></Image>
                                <Text style={styles.outrasText2}>
                                    {event.horario}
                                </Text>
                            </View>
                            <View style={styles.containerOutrasText}>
                                <Image style={styles.iconOutras} source={require('./assets/icons/eventImg.png')}></Image>
                                <Text style={styles.outrasText2}>
                                    {event.dataEvento ? formatData(event.dataEvento) : 'Data não disponível'}
                                </Text>
                            </View>

                        </View>
                        <View style={styles.participantes}>


                        </View>

                    </View>
                </ScrollView>

                <View style={styles.containerBotaoBaixo}>
                    <TouchableOpacity onPress={handleGarantirTicket} style={[styles.botaoBaixo, styles.backButton]}>
                        <Text style={styles.textoBotao}>Garantir Ticket</Text>
                    </TouchableOpacity>
                </View>
                {/* Modal para mostrar a mensagem de pagamento */}
                // Modal para mostrar a mensagem de pagamento
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalText}>
                              Olá   Pague o valor de R$ {event.preco} para confirmar sua inscrição e garantir seu ticket.
                            </Text>
                            <View style={styles.modalButtonContainer}>
                                {/* Botão Pagar */}
                                
                                {/* Botão Cancelar */}
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalCancelButton]}
                                    onPress={() => setModalVisible(false)} // Fecha o modal ao clicar em Cancelar
                                >
                                    <Text style={styles.modalButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={() => {
                                        // Lógica para processar o pagamento (ex: redirecionar para pagamento)
                                        console.log('Processando pagamento...');
                                        setModalVisible(false); // Fecha o modal após clicar em Pagar
                                    }}
                                >
                                    <Text style={styles.modalButtonText}>Pagar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>


            </ImageBackground>
        </ImageBackground>
    );
};
const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '100%',
        padding: 20,
        backgroundColor: '#000',
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 'auto',
        height: 400,

    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#fff'
    },
    modalButton: {
        backgroundColor: '#007BFF',
        height: 40,
        width: 90,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },
    modalButtonContainer: {
        flexDirection: 'row',

    },
    scrollContainer: {
        paddingBottom: 70,
    },
    CarregamentoEvento: {
        width: 100,
        height: 100,
    },
    iconOutras: {
        width: 15,
        height: 15,
        tintColor: '#fff',
    },
    cimaInfo: {


    },
    eventPreco: {
        color: '#fff',
        fontSize: 17,
        fontFamily: 'Montserrat-SemiBold',
        marginRight: 20,

    },
    containerOutrasText: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,

    },
    outrasInformacoes: {
        marginVertical: 10,

    },
    outrasText2: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 12,
        color: '#fff',
        alignItems: 'center',
        marginLeft: 5,

    },
    outrasText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Montserrat-SemiBold',
        marginTop: 10,

    },
    containerBotaoDescription: {
        flexDirection: 'row',
    },

    botaoDescription: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#F5EFE8',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 10,
        marginHorizontal: 5,
    },
    textBotaoDescription: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 10,
        color: '#79532A'

    },
    imgBotao: {
        width: 20,
        height: 20,
        marginRight: 5,
        tintColor: '#79532A',
    },
    eventImageContainer: {
        marginTop: 150,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    container: {
        flex: 1,
    },
    container2: {
        flex: 1,
        padding: 20,
    },


    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    errorText: {
        color: '#FFF',
        fontSize: 18,
    },

    imageEvent: {
        width: 105,
        borderRadius: 100000,
        height: 105,
        borderWidth: 4,
        borderColor: '#fff',
        marginBottom: 50,
        marginHorizontal: 'auto'

    },

    eventTitle: {
        color: '#fff',
        fontSize: 33,
        fontFamily: 'Montserrat-Bold',
    },
    eventSubTitle: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Montserrat-Regular',
    },

    eventDate: {
        color: '#bbb',
        fontSize: 16,

        fontFamily: 'Inter-Regular',
    },
    containerDescription: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 15,
        borderWidth: 0.2,
        borderColor: '#fff',
        padding: 20,
        marginTop: 10,
        justifyContent: 'center',
        textAlign: 'center',
    },
    eventDescription: {
        color: '#fff',
        fontWeight: 100,
        fontSize: 16,
        marginTop: 10,
        fontFamily: 'Raleway-Regular',
    },
    botoes: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    botao: {
        padding: 8,
        backgroundColor: 'transparent',
        borderWidth: 0.5,
        borderColor: '#fff',
        borderRadius: 8,
        marginLeft: 10,
    },
    gostar: {
        width: 23,
        height: 23,
        tintColor: '#FFF',
    },

    botaoBaixo: {
        height: 45,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10, // Margem entre os botões
    },
    backButton: {
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',  // Ajuste o tamanho conforme necessário

    },
    containerBotaoBaixo: {
        flexDirection: 'row',
        justifyContent: 'center', // Centraliza o botão horizontalmente
        alignItems: 'center', // Centraliza o botão verticalmente
        width: '100%',
        marginTop: 'auto',
        height: 100,
        top: 700, // Distância do fundo
        position: 'absolute',
        left: 25,
    },
    textoBotao: {
        color: '#000',
        fontSize: 14,
        fontFamily: 'Montserrat-Bold',
    },

});

export default EventoScreen;
