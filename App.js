import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  SafeAreaView, 
  ActivityIndicator 
} from 'react-native';

const API_URL = 'https://club80-backend.onrender.com';

export default function App() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Récupérer les stories depuis le backend Render
  const fetchStories = async () => {
    try {
      const res = await fetch(`${API_URL}/stories`);
      const data = await res.json();
      if (data.stories) {
        setStories(data.stories);
      }
    } catch (err) {
      console.error('Erreur chargement stories:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStories();
    }
  }, [user]);

  // Connexion
  const handleLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
      } else {
        setErrorMsg(data.error || 'Erreur de connexion');
      }
    } catch (err) {
      setErrorMsg('Impossible de joindre le serveur.');
    } finally {
      setLoading(false);
    }
  };

  // Inscription
  const handleRegister = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
      } else {
        setErrorMsg(data.error || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setErrorMsg('Impossible de joindre le serveur.');
    } finally {
      setLoading(false);
    }
  };

  // Écran d'authentification
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authBox}>
          <Text style={styles.title}>Club 80</Text>
          <Text style={styles.subtitle}>{isRegistering ? 'Créer un compte' : 'Connexion'}</Text>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Nom d'utilisateur"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={isRegistering ? handleRegister : handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{isRegistering ? "S'inscrire" : 'Se connecter'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
            <Text style={styles.switchText}>
              {isRegistering 
                ? 'Déjà un compte ? Se connecter' 
                : "Pas encore de compte ? S'inscrire"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Écran principal (Feed & Stories)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Club 80</Text>
        <Text style={styles.userTag}>@ {user.username}</Text>
      </View>

      <View style={styles.storiesContainer}>
        <Text style={styles.sectionTitle}>Stories</Text>
        {stories.length === 0 ? (
          <Text style={styles.emptyText}>Aucune story pour le moment</Text>
        ) : (
          <FlatList
            horizontal
            data={stories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.storyItem}>
                <Image source={{ uri: item.media_url }} style={styles.storyImage} />
                <Text style={styles.storyUser}>{item.username}</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  authBox: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#111', marginBottom: 5 },
  subtitle: { fontSize: 18, textAlign: 'center', color: '#666', marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  switchText: { marginTop: 15, color: '#007AFF', textAlign: 'center' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
  header: { padding: 20, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  userTag: { color: '#666', fontWeight: '600' },
  storiesContainer: { padding: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  emptyText: { color: '#888', fontStyle: 'italic' },
  storyItem: { marginRight: 15, alignItems: 'center' },
  storyImage: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#007AFF' },
  storyUser: { marginTop: 5, fontSize: 12, color: '#333' }
});