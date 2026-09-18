import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  SafeAreaView, 
  ActivityIndicator,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  Share,
  RefreshControl,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  PanResponder,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

function AmigosLogo({ size = 72 }) {
  return (
    <View style={[styles.logoOuterShell, { width: size, height: size, borderRadius: size * 0.35 }]}>
      <View style={styles.logoInnerCore}>
        <Text style={[styles.logoLetter, { fontSize: size * 0.48 }]}>A</Text>
        <View style={styles.logoNeonDot} />
      </View>
    </View>
  );
}

function CreatePostBox({ onPublish, postImageUri, setPostImageUri, pickImageForPost, musicUrl, setMusicUrl }) {
  const [text, setText] = useState('');
  const [showMusicInput, setShowMusicInput] = useState(false);
  const [tempMusic, setTempMusic] = useState('');
  
  const [showPollInput, setShowPollInput] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOpt1, setPollOpt1] = useState('');
  const [pollOpt2, setPollOpt2] = useState('');
  const [pollData, setPollData] = useState(null);

  const MAX_CHARS = 280;

  const handleValidatePoll = () => {
    if (pollQuestion.trim() && pollOpt1.trim() && pollOpt2.trim()) {
      setPollData({
        question: pollQuestion.trim(),
        options: [
          { text: pollOpt1.trim(), votes: 0 },
          { text: pollOpt2.trim(), votes: 0 }
        ],
        voted: false
      });
      setShowPollInput(false);
      setPollQuestion('');
      setPollOpt1('');
      setPollOpt2('');
    }
  };

  return (
    <View style={styles.createPostBox}>
      <TextInput 
        style={styles.createPostInput} 
        placeholder="Qu'est-ce qui se passe les amigos ? ☀️" 
        placeholderTextColor="#8C8296" 
        multiline 
        maxLength={MAX_CHARS}
        value={text} 
        onChangeText={setText} 
      />
      
      {postImageUri && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: postImageUri }} style={styles.previewImage} />
          <TouchableOpacity style={styles.removePreviewBtn} onPress={() => setPostImageUri(null)}>
            <Text style={styles.removePreviewText}>✕ Retirer</Text>
          </TouchableOpacity>
        </View>
      )}

      {pollData && (
        <View style={styles.pollPreviewBadge}>
          <Text style={styles.pollPreviewTitle}>📊 {pollData.question}</Text>
          <Text style={styles.pollPreviewOpts}>1. {pollData.options[0].text}  •  2. {pollData.options[1].text}</Text>
          <TouchableOpacity onPress={() => setPollData(null)}><Text style={{ color: '#FF3B30', fontSize: 11, marginTop: 4 }}>Supprimer le sondage</Text></TouchableOpacity>
        </View>
      )}

      {showPollInput && !pollData && (
        <View style={styles.pollCreatorBox}>
          <TextInput style={styles.smallInput} placeholder="Question du sondage..." placeholderTextColor="#8C8296" value={pollQuestion} onChangeText={setPollQuestion} />
          <TextInput style={styles.smallInput} placeholder="Option 1" placeholderTextColor="#8C8296" value={pollOpt1} onChangeText={setPollOpt1} />
          <TextInput style={styles.smallInput} placeholder="Option 2" placeholderTextColor="#8C8296" value={pollOpt2} onChangeText={setPollOpt2} />
          <TouchableOpacity style={styles.pollValidateBtn} onPress={handleValidatePoll}><Text style={styles.pollValidateText}>Valider le sondage</Text></TouchableOpacity>
        </View>
      )}

      {musicUrl && (
        <View style={styles.musicBadgePreview}>
          <Text style={styles.musicBadgeText}>🎵 Morceau attaché</Text>
          <TouchableOpacity onPress={() => setMusicUrl(null)}><Text style={{ color: '#FF3B30', fontSize: 12 }}>✕</Text></TouchableOpacity>
        </View>
      )}

      {showMusicInput && (
        <View style={styles.inlineInputRow}>
          <TextInput 
            style={[styles.smallInput, { flex: 1, marginBottom: 0 }]} 
            placeholder="Lien Spotify / Apple Music..." 
            placeholderTextColor="#8C8296"
            value={tempMusic}
            onChangeText={setTempMusic}
          />
          <TouchableOpacity 
            style={styles.inlineOkBtn}
            onPress={() => { if(tempMusic.trim()) { setMusicUrl(tempMusic.trim()); setShowMusicInput(false); setTempMusic(''); }}}
          >
            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '800' }}>OK</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.createPostFooter}>
        <View style={styles.toolsRow}>
          <TouchableOpacity activeOpacity={0.7} style={[styles.toolBtn, postImageUri && styles.toolBtnActive]} onPress={pickImageForPost}>
            <Text style={styles.toolBtnText}>📷 Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={[styles.toolBtn, musicUrl && styles.toolBtnActive]} onPress={() => setShowMusicInput(!showMusicInput)}>
            <Text style={styles.toolBtnText}>🎵 Musique</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={[styles.toolBtn, pollData && styles.toolBtnActive]} onPress={() => setShowPollInput(!showPollInput)}>
            <Text style={styles.toolBtnText}>📊 Sondage</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity activeOpacity={0.8} style={styles.postSubmitBtn} onPress={() => { onPublish(text, pollData); setText(''); setMusicUrl(null); setPollData(null); }}>
          <Text style={styles.postSubmitText}>Partager 🚀</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [bio, setBio] = useState('Toujours partant pour de nouvelles aventures !');
  const [status, setStatus] = useState('🔥 En pleine forme');
  const [secretMode, setSecretMode] = useState(false);
  
  const [activeTab, setActiveTab] = useState('feed'); 
  const [activeFeedFilter, setActiveFeedFilter] = useState('all'); 
  const [refreshing, setRefreshing] = useState(false);

  // Listes nettoyées des faux profils
  const [stories, setStories] = useState([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [storyCommentText, setStoryCommentText] = useState('');
  const [lastTap, setLastTap] = useState(null);
  const [showLikeHeart, setShowLikeHeart] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy > 60) {
          setActiveStoryIndex(null);
        }
      },
    })
  ).current;

  const [activeChatUser, setActiveChatUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(false);
  
  const [conversations, setConversations] = useState([]);
  const [privateMessages, setPrivateMessages] = useState({});

  const [posts, setPosts] = useState([]);
  const [postImageUri, setPostImageUri] = useState(null);
  const [postMusicUrl, setPostMusicUrl] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);

  const [marketItems, setMarketItems] = useState([]);
  const [marketTitle, setMarketTitle] = useState('');
  const [marketPrice, setMarketPrice] = useState('');
  const [marketDesc, setMarketDesc] = useState('');

  const [services, setServices] = useState([]);
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');

  const membersLocations = [];

  useEffect(() => {
    loadSavedData().finally(() => setIsReady(true));
  }, []);

  const loadSavedData = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('@amigos_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (parsedUser.bio) setBio(parsedUser.bio);
        if (parsedUser.status) setStatus(parsedUser.status);
      }
      const savedPosts = await AsyncStorage.getItem('@amigos_posts');
      if (savedPosts) setPosts(JSON.parse(savedPosts));
      const savedBookmarks = await AsyncStorage.getItem('@amigos_bookmarks');
      if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
      const savedMarket = await AsyncStorage.getItem('@amigos_market');
      if (savedMarket) setMarketItems(JSON.parse(savedMarket));
      const savedServices = await AsyncStorage.getItem('@amigos_services');
      if (savedServices) setServices(JSON.parse(savedServices));
      const savedConversations = await AsyncStorage.getItem('@amigos_conversations');
      if (savedConversations) setConversations(JSON.parse(savedConversations));
      const savedMessages = await AsyncStorage.getItem('@amigos_private_messages');
      if (savedMessages) setPrivateMessages(JSON.parse(savedMessages));
    } catch (e) {}
  };

  const saveUserData = async (userData) => {
    try {
      setUser(userData);
      await AsyncStorage.setItem('@amigos_user', JSON.stringify(userData));
    } catch (e) {}
  };

  const handleLogout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('@amigos_user');
    } catch (e) {}
  };

  const handleAuth = async () => {
    if (!username || !password) {
      setErrorMsg('Remplis tous les champs s\'il te plaît !');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const userData = { username, status: 'approved', bio: 'Toujours partant pour de nouvelles aventures !', status: '🔥 En pleine forme' };
      await saveUserData(userData);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => { loadSavedData(); setRefreshing(false); }, 800);
  }, []);

  const pickImageForPost = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) setPostImageUri(result.assets[0].uri);
  };

  const handleAddStory = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [9, 16], quality: 0.8 });
    if (!result.canceled) {
      const newStory = { id: Date.now().toString(), username: user.username, media_url: result.assets[0].uri, time: 'À l\'instant', likes: 0, likedByMe: false, comments: [] };
      setStories([newStory, ...stories]);
    }
  };

  const handleDeleteStory = (storyId) => {
    setStories(stories.filter(s => s.id !== storyId));
    setActiveStoryIndex(null);
  };

  const handleStoryPress = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (lastTap && (now - lastTap) < DOUBLE_PRESS_DELAY) {
      handleLikeCurrentStory();
    } else {
      setLastTap(now);
      setTimeout(() => {
        if ((Date.now() - now) >= DOUBLE_PRESS_DELAY) {
          if (activeStoryIndex !== null) {
            if (activeStoryIndex < stories.length - 1) {
              setActiveStoryIndex(activeStoryIndex + 1);
            } else {
              setActiveStoryIndex(null);
            }
          }
        }
      }, DOUBLE_PRESS_DELAY);
    }
  };

  const handleLikeCurrentStory = () => {
    if (activeStoryIndex === null) return;
    const updated = [...stories];
    const current = updated[activeStoryIndex];
    current.likedByMe = !current.likedByMe;
    current.likes = current.likedByMe ? current.likes + 1 : current.likes - 1;
    setStories(updated);

    setShowLikeHeart(true);
    setTimeout(() => setShowLikeHeart(false), 800);
  };

  const handleAddStoryComment = () => {
    if (!storyCommentText.trim() || activeStoryIndex === null) return;
    const updated = [...stories];
    updated[activeStoryIndex].comments.push({
      id: Date.now().toString(),
      author: user.username,
      text: storyCommentText.trim()
    });
    setStories(updated);
    setStoryCommentText('');
  };

  const handleToggleLike = async (postId) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) return { ...post, likedByMe: !post.likedByMe, likes: post.likedByMe ? post.likes - 1 : post.likes + 1 };
      return post;
    });
    setPosts(updatedPosts);
    await AsyncStorage.setItem('@amigos_posts', JSON.stringify(updatedPosts));
  };

  const handleToggleBookmark = async (postId) => {
    let updatedBookmarks = [...bookmarks];
    if (updatedBookmarks.includes(postId)) {
      updatedBookmarks = updatedBookmarks.filter(id => id !== postId);
    } else {
      updatedBookmarks.push(postId);
    }
    setBookmarks(updatedBookmarks);
    await AsyncStorage.setItem('@amigos_bookmarks', JSON.stringify(updatedBookmarks));
  };

  const handleSharePost = async (postText) => {
    try {
      await Share.share({ message: `Regarde ça sur Amigos : "${postText}"` });
    } catch (error) {}
  };

  const handleCreatePost = async (text, pollData) => {
    if (!text.trim() && !postImageUri && !pollData) return;
    const newPost = { id: Date.now().toString(), author: user.username, text, image: postImageUri, musicUrl: postMusicUrl, poll: pollData, likes: 0, likedByMe: false, time: 'À l\'instant' };
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    await AsyncStorage.setItem('@amigos_posts', JSON.stringify(updatedPosts));
  };

  const handleAddMarketItem = async () => {
    if (!marketTitle.trim() || !marketPrice.trim()) return;
    const newItem = { id: Date.now().toString(), title: marketTitle.trim(), price: marketPrice.trim(), author: user.username, desc: marketDesc.trim() || 'Superbe occasion !' };
    const updatedMarket = [newItem, ...marketItems];
    setMarketItems(updatedMarket);
    setMarketTitle('');
    setMarketPrice('');
    setMarketDesc('');
    await AsyncStorage.setItem('@amigos_market', JSON.stringify(updatedMarket));
  };

  const handleAddServiceItem = async () => {
    if (!serviceTitle.trim() || !serviceCategory.trim()) return;
    const newService = { id: Date.now().toString(), title: serviceTitle.trim(), provider: user.username, category: serviceCategory.trim(), desc: serviceDesc.trim() || 'Service proposé entre amis.' };
    const updatedServices = [newService, ...services];
    setServices(updatedServices);
    setServiceTitle('');
    setServiceCategory('');
    setServiceDesc('');
    await AsyncStorage.setItem('@amigos_services', JSON.stringify(updatedServices));
  };

  const handleSendPrivateMessage = async () => {
    if (!newMessage.trim() || !activeChatUser) return;
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;
    const newMsg = { id: Date.now().toString(), sender: user.username, text: newMessage, time: timeStr };
    
    const currentChatHistory = privateMessages[activeChatUser] || [];
    const updatedMessages = { ...privateMessages, [activeChatUser]: [...currentChatHistory, newMsg] };
    setPrivateMessages(updatedMessages);
    await AsyncStorage.setItem('@amigos_private_messages', JSON.stringify(updatedMessages));

    const updatedConversations = conversations.map(conv => {
      if (conv.withUser === activeChatUser) return { ...conv, lastMessage: newMessage, time: timeStr };
      return conv;
    });
    setConversations(updatedConversations);
    await AsyncStorage.setItem('@amigos_conversations', JSON.stringify(updatedConversations));

    setNewMessage('');
  };

  const filteredPosts = posts.filter(post => {
    if (activeFeedFilter === 'all') return true;
    if (activeFeedFilter === 'photos') return !!post.image;
    if (activeFeedFilter === 'polls') return !!post.poll;
    if (activeFeedFilter === 'music') return !!post.musicUrl;
    return true;
  });

  const bookmarkedPostsData = posts.filter(post => bookmarks.includes(post.id));

  if (!isReady) {
    return (
      <SafeAreaView style={[styles.authContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="light-content" />
        <AmigosLogo size={80} />
        <ActivityIndicator size="large" color="#FF5722" style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.authBox}>
          <View style={styles.logoContainer}>
            <AmigosLogo size={96} />
            <Text style={styles.logoTitle}>AMIGOS</Text>
          </View>
          <Text style={styles.subtitle}>{isRegistering ? 'Rejoins la communauté vibrante ✨' : 'Heureux de te revoir ! 👋'}</Text>
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          <TextInput style={styles.input} placeholder="Ton pseudo" placeholderTextColor="#8C8296" value={username} onChangeText={setUsername} autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Ton mot de passe" placeholderTextColor="#8C8296" secureTextEntry value={password} onChangeText={setPassword} />
          <TouchableOpacity activeOpacity={0.8} style={styles.primaryButton} onPress={handleAuth} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>{isRegistering ? "C'est parti !" : 'Connexion 🚀'}</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
            <Text style={styles.switchText}>{isRegistering ? 'Déjà un compte ? Connecte-toi' : 'Nouveau ? Crée ton compte'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  return (
    <SafeAreaView style={[styles.mainContainer, secretMode && { opacity: 0.1 }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerLogoGroup}>
          <AmigosLogo size={36} />
          <Text style={styles.headerTitle}>AMIGOS</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtnBadge} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sortir 🚪</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {activeTab === 'feed' && (
          <FlatList
            data={filteredPosts}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF5722" />}
            ListHeaderComponent={() => (
              <View>
                <View style={styles.storiesContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                    <TouchableOpacity activeOpacity={0.8} style={styles.addStoryItem} onPress={handleAddStory}>
                      <View style={styles.addStoryCircle}><Text style={{ fontSize: 24, color: '#FFF' }}>+</Text></View>
                      <Text style={styles.storyName}>Ta Story</Text>
                    </TouchableOpacity>

                    {stories.map((story, index) => (
                      <TouchableOpacity key={story.id} activeOpacity={0.9} style={styles.storyItem} onPress={() => setActiveStoryIndex(index)}>
                        <View style={styles.storyRing}>
                          <Image source={{ uri: story.media_url }} style={styles.storyAvatar} />
                        </View>
                        <Text style={styles.storyName} numberOfLines={1}>@{story.username}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.tabContentHeader}>
                  <CreatePostBox 
                    onPublish={handleCreatePost} 
                    postImageUri={postImageUri} 
                    setPostImageUri={setPostImageUri} 
                    pickImageForPost={pickImageForPost}
                    musicUrl={postMusicUrl}
                    setMusicUrl={setPostMusicUrl}
                  />
                  
                  <View style={styles.filterRow}>
                    <TouchableOpacity onPress={() => setActiveFeedFilter('all')} style={[styles.filterChip, activeFeedFilter === 'all' && styles.filterChipActive]}>
                      <Text style={[styles.filterChipText, activeFeedFilter === 'all' && styles.filterChipTextActive]}>✨ Tous</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveFeedFilter('photos')} style={[styles.filterChip, activeFeedFilter === 'photos' && styles.filterChipActive]}>
                      <Text style={[styles.filterChipText, activeFeedFilter === 'photos' && styles.filterChipTextActive]}>📷 Photos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveFeedFilter('polls')} style={[styles.filterChip, activeFeedFilter === 'polls' && styles.filterChipActive]}>
                      <Text style={[styles.filterChipText, activeFeedFilter === 'polls' && styles.filterChipTextActive]}>📊 Sondages</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveFeedFilter('music')} style={[styles.filterChip, activeFeedFilter === 'music' && styles.filterChipActive]}>
                      <Text style={[styles.filterChipText, activeFeedFilter === 'music' && styles.filterChipTextActive]}>🎵 Musique</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            renderItem={({ item }) => {
              const isBookmarked = bookmarks.includes(item.id);
              return (
                <View style={styles.postCard}>
                  <View style={styles.postHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={styles.postAvatarMini}><Text style={styles.postAvatarMiniText}>{item.author.charAt(0)}</Text></View>
                      <Text style={styles.postAuthor}>@{item.author}</Text>
                    </View>
                    <Text style={styles.postTime}>{item.time}</Text>
                  </View>
                  {item.text ? <Text style={styles.postText}>{item.text}</Text> : null}
                  {item.image ? <Image source={{ uri: item.image }} style={styles.postImage} resizeMode="cover" /> : null}
                  <View style={styles.postInteractionsRow}>
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity activeOpacity={0.7} style={styles.actionBtn} onPress={() => handleToggleLike(item.id)}>
                        <Text style={[styles.actionBtnText, item.likedByMe && styles.likedText]}>{item.likedByMe ? '❤️' : '🤍'} {item.likes}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={0.7} style={styles.actionBtn} onPress={() => handleSharePost(item.text || "Post Amigos")}>
                        <Text style={styles.actionBtnText}>📤 Partager</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity activeOpacity={0.7} style={styles.actionBtn} onPress={() => handleToggleBookmark(item.id)}>
                      <Text style={[styles.actionBtnText, isBookmarked && { color: '#FF5722' }]}>{isBookmarked ? '🔖' : '📑'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}

        {activeTab === 'map' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>📍 La Carte des Amigos</Text>
            <FlatList data={membersLocations} keyExtractor={(item) => item.id} renderItem={({ item }) => (
              <View style={styles.mapMemberCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <View style={styles.mapDotOnline} />
                  <Text style={styles.serviceTitle}>@{item.name}</Text>
                </View>
                <Text style={styles.serviceAuthor}>{item.status}</Text>
                <Text style={{ color: '#8C8296', fontSize: 11, marginTop: 4 }}>Position : {item.coord}</Text>
                <TouchableOpacity 
                  style={styles.gpsRouteBtn}
                  onPress={() => Linking.openURL(`https://maps.google.com/?q=${item.status}`)}
                >
                  <Text style={styles.gpsRouteBtnText}>Ouvrir dans le GPS 🗺️</Text>
                </TouchableOpacity>
              </View>
            )} ListEmptyComponent={() => (
              <Text style={{ textAlign: 'center', color: '#8C8296', marginTop: 20 }}>Aucun membre sur la carte pour l'instant.</Text>
            )} />
          </View>
        )}

        {activeTab === 'market' && (
          <FlatList
            data={marketItems}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={() => (
              <View style={styles.tabContent}>
                <Text style={styles.sectionTitle}>🏷️ Le Marché & Bons Plans</Text>
                <View style={styles.addServiceBox}>
                  <TextInput style={styles.smallInput} placeholder="Nom de l'objet ou du service..." placeholderTextColor="#8C8296" value={marketTitle} onChangeText={setMarketTitle} />
                  <TextInput style={styles.smallInput} placeholder="Prix (ex: 30€)" placeholderTextColor="#8C8296" value={marketPrice} onChangeText={setMarketPrice} />
                  <TextInput style={styles.smallInput} placeholder="Petite description..." placeholderTextColor="#8C8296" value={marketDesc} onChangeText={setMarketDesc} />
                  <TouchableOpacity activeOpacity={0.8} style={styles.addBtn} onPress={handleAddMarketItem}><Text style={styles.addBtnText}>Publier l'annonce 🛍️</Text></TouchableOpacity>
                </View>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={styles.serviceCard}>
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceTitle}>{item.title}</Text>
                  <Text style={styles.servicePrice}>{item.price}</Text>
                </View>
                <Text style={styles.serviceAuthor}>Posté par @{item.author}</Text>
                <Text style={styles.serviceDesc}>{item.desc}</Text>
              </View>
            )}
          />
        )}

        {activeTab === 'services' && (
          <FlatList
            data={services}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={() => (
              <View style={styles.tabContent}>
                <Text style={styles.sectionTitle}>🤝 Entraide & Services</Text>
                <View style={styles.addServiceBox}>
                  <TextInput style={styles.smallInput} placeholder="Titre du service (ex: Covoiturage...)" placeholderTextColor="#8C8296" value={serviceTitle} onChangeText={setServiceTitle} />
                  <TextInput style={styles.smallInput} placeholder="Catégorie (ex: Trajet, Bricolage...)" placeholderTextColor="#8C8296" value={serviceCategory} onChangeText={setServiceCategory} />
                  <TextInput style={styles.smallInput} placeholder="Détails du service..." placeholderTextColor="#8C8296" value={serviceDesc} onChangeText={setServiceDesc} />
                  <TouchableOpacity activeOpacity={0.8} style={styles.addBtn} onPress={handleAddServiceItem}><Text style={styles.addBtnText}>Proposer un service 🤝</Text></TouchableOpacity>
                </View>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={styles.serviceCard}>
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceTitle}>{item.title}</Text>
                  <Text style={styles.servicePrice}>{item.category}</Text>
                </View>
                <Text style={styles.serviceAuthor}>Proposé par @{item.provider}</Text>
                <Text style={styles.serviceDesc}>{item.desc}</Text>
              </View>
            )}
          />
        )}

        {activeTab === 'chat' && (
          <View style={{ flex: 1 }}>
            {!activeChatUser ? (
              <View style={styles.tabContent}>
                <Text style={styles.sectionTitle}>💬 Messages de la Bande</Text>
                <FlatList data={conversations} keyExtractor={(item) => item.id} renderItem={({ item }) => (
                    <TouchableOpacity activeOpacity={0.8} style={styles.conversationCard} onPress={() => { setActiveChatUser(item.withUser); setUnreadMessages(false); }}>
                      <View style={styles.conversationAvatar}><Text style={styles.conversationAvatarText}>{item.withUser.charAt(0)}</Text></View>
                      <View style={styles.conversationInfo}>
                        <View style={styles.conversationHeader}>
                          <Text style={styles.conversationName}>@{item.withUser}</Text>
                          <Text style={styles.conversationTime}>{item.time}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                          <Text style={styles.conversationLastMessage} numberOfLines={1}>{item.lastMessage}</Text>
                          <Text style={{ fontSize: 10, color: '#FF5722', fontWeight: '700' }}>{item.status}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )} ListEmptyComponent={() => (
                    <Text style={{ textAlign: 'center', color: '#8C8296', marginTop: 20 }}>Aucune conversation active pour le moment.</Text>
                  )}
                />
              </View>
            ) : (
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.chatContainer}>
                <View style={styles.privateChatHeader}>
                  <TouchableOpacity onPress={() => setActiveChatUser(null)} style={styles.backButton}><Text style={styles.backButtonText}>← Retour</Text></TouchableOpacity>
                  <Text style={styles.privateChatTitle}>@{activeChatUser}</Text>
                  <View style={{ width: 60 }} />
                </View>
                <FlatList data={privateMessages[activeChatUser] || []} keyExtractor={(item) => item.id} contentContainerStyle={{ padding: 16 }} renderItem={({ item }) => {
                    const isMe = item.sender === user.username;
                    return (
                      <View style={[styles.msgBubble, isMe ? styles.msgMe : styles.msgOther]}>
                        <Text style={isMe ? styles.msgTextMe : styles.msgTextOther}>{item.text}</Text>
                        <Text style={[styles.msgTime, isMe ? styles.timeMe : styles.timeOther]}>{item.time}</Text>
                      </View>
                    );
                  }}
                />
                <View style={styles.chatInputRow}>
                  <TextInput style={styles.chatInput} placeholder="Écris un message..." placeholderTextColor="#8C8296" value={newMessage} onChangeText={setNewMessage} />
                  <TouchableOpacity activeOpacity={0.8} style={styles.sendButton} onPress={handleSendPrivateMessage}><Text style={styles.sendButtonText}>Envoyer 🚀</Text></TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            )}
          </View>
        )}

        {activeTab === 'profile' && (
          <FlatList
            data={bookmarkedPostsData}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={() => (
              <View style={styles.profileBox}>
                <View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>{user.username.charAt(0).toUpperCase()}</Text></View>
                <Text style={styles.profileName}>@{user.username}</Text>
                <Text style={styles.profileBio}>{bio}</Text>
                <View style={styles.statusPill}><Text style={styles.statusPillText}>{status}</Text></View>
                
                <TouchableOpacity 
                  activeOpacity={0.8} 
                  style={[styles.secretModeToggle, secretMode && styles.secretModeActive]} 
                  onPress={() => setSecretMode(!secretMode)}
                >
                  <Text style={styles.secretModeText}>{secretMode ? '🔒 Mode Discret (Actif)' : '👁️ Activer Mode Discret'}</Text>
                </TouchableOpacity>
                <Text style={styles.sectionTitleProfile}>🔖 Tes publications enregistrées</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={[styles.postCard, { marginHorizontal: 16, marginBottom: 12 }]}>
                <Text style={styles.postAuthor}>@{item.author}</Text>
                <Text style={[styles.postText, { marginTop: 6 }]}>{item.text}</Text>
              </View>
            )}
            ListEmptyComponent={() => (
               <Text style={{ textAlign: 'center', color: '#8C8296', marginTop: 20 }}>Aucun post sauvegardé pour le moment.</Text>
            )}
          />
        )}
      </View>

      {currentStory && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.storyModalContainer} {...panResponder.panHandlers}>
            
            <View style={styles.storyHeaderInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.storyModalAvatarMini}>
                  <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 12 }}>{currentStory.username.charAt(0)}</Text>
                </View>
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.storyModalAuthor}>@{currentStory.username}</Text>
                  <Text style={styles.storyModalTime}>{currentStory.time}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {currentStory.username === user.username && (
                  <TouchableOpacity style={styles.storyDeleteBtn} onPress={() => handleDeleteStory(currentStory.id)}>
                    <Text style={{ color: '#FF3B30', fontSize: 12, fontWeight: '700', marginRight: 12 }}>🗑️ Supprimer</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.storyCloseBtn} onPress={() => setActiveStoryIndex(null)}>
                  <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900' }}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableWithoutFeedback onPress={handleStoryPress}>
              <View style={styles.storyImageWrapper}>
                <Image source={{ uri: currentStory.media_url }} style={styles.storyFullImage} resizeMode="cover" />

                {showLikeHeart && (
                  <View style={styles.bigHeartContainer}>
                    <Text style={{ fontSize: 80 }}>❤️</Text>
                  </View>
                )}

                <TouchableOpacity style={styles.storyLikeOverlayBtn} onPress={handleLikeCurrentStory}>
                  <Text style={{ fontSize: 20 }}>{currentStory.likedByMe ? '❤️' : '🤍'}</Text>
                  <Text style={styles.storyLikeCountText}>{currentStory.likes}</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>

            <View style={styles.storyCommentsSection}>
              <ScrollView style={{ maxHeight: 90 }} contentContainerStyle={{ paddingHorizontal: 16 }}>
                {currentStory.comments.map((comm) => (
                  <View key={comm.id} style={styles.storyCommentBubble}>
                    <Text style={styles.storyCommentAuthor}>@{comm.author} : </Text>
                    <Text style={styles.storyCommentText}>{comm.text}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.storyReplyBox}>
              <TextInput 
                style={styles.storyReplyInput} 
                placeholder={`Commenter la story de @${currentStory.username}...`} 
                placeholderTextColor="#8C8296"
                value={storyCommentText}
                onChangeText={setStoryCommentText}
              />
              <TouchableOpacity style={styles.storyReplySend} onPress={handleAddStoryComment}>
                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 13 }}>Envoyer 💬</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>

          </View>
        </Modal>
      )}

      <View style={styles.navbarWrapper}>
        <View style={styles.navbar}>
          <TouchableOpacity activeOpacity={0.8} style={styles.navItem} onPress={() => { setActiveTab('feed'); setActiveChatUser(null); }}><Text style={[styles.navIcon, activeTab === 'feed' && styles.navActive]}>🏠</Text><Text style={[styles.navText, activeTab === 'feed' && styles.navActiveText]}>Accueil</Text></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.navItem} onPress={() => { setActiveTab('map'); setActiveChatUser(null); }}><Text style={[styles.navIcon, activeTab === 'map' && styles.navActive]}>🗺️</Text><Text style={[styles.navText, activeTab === 'map' && styles.navActiveText]}>Carte</Text></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.navItem} onPress={() => { setActiveTab('market'); setActiveChatUser(null); }}><Text style={[styles.navIcon, activeTab === 'market' && styles.navActive]}>🏷️</Text><Text style={[styles.navText, activeTab === 'market' && styles.navActiveText]}>Marché</Text></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.navItem} onPress={() => { setActiveTab('services'); setActiveChatUser(null); }}><Text style={[styles.navIcon, activeTab === 'services' && styles.navActive]}>🤝</Text><Text style={[styles.navText, activeTab === 'services' && styles.navActiveText]}>Services</Text></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.navItem} onPress={() => { setActiveTab('chat'); }}><View><Text style={[styles.navIcon, activeTab === 'chat' && styles.navActive]}>💬</Text>{unreadMessages && <View style={styles.badgeDot} />}</View><Text style={[styles.navText, activeTab === 'chat' && styles.navActiveText]}>Chat</Text></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.navItem} onPress={() => { setActiveTab('profile'); setActiveChatUser(null); }}><Text style={[styles.navIcon, activeTab === 'profile' && styles.navActive]}>👤</Text><Text style={[styles.navText, activeTab === 'profile' && styles.navActiveText]}>Profil</Text></TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logoOuterShell: { backgroundColor: '#FF5722', justifyContent: 'center', alignItems: 'center', shadowColor: '#FF5722', shadowOpacity: 0.7, shadowRadius: 14, elevation: 8 },
  logoInnerCore: { width: '80%', height: '80%', borderRadius: 99, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  logoLetter: { color: '#FFF', fontWeight: '900', letterSpacing: -1 },
  logoNeonDot: { position: 'absolute', bottom: 3, width: 6, height: 6, borderRadius: 3, backgroundColor: '#00E5FF' },

  authContainer: { flex: 1, backgroundColor: '#130F1A', justifyContent: 'center' },
  authBox: { paddingHorizontal: 30 },
  logoContainer: { alignItems: 'center', marginBottom: 25 },
  logoTitle: { color: '#FFF', fontSize: 36, fontWeight: '900', letterSpacing: 4, marginTop: 14 },
  subtitle: { color: '#A295B3', textAlign: 'center', marginBottom: 30, fontSize: 13, fontWeight: '700' },
  input: { backgroundColor: '#1E1829', borderWidth: 1, borderColor: '#2D253D', color: '#FFF', padding: 16, borderRadius: 18, marginBottom: 14, fontSize: 14 },
  primaryButton: { backgroundColor: '#FF5722', padding: 16, borderRadius: 18, alignItems: 'center', marginTop: 10, shadowColor: '#FF5722', shadowOpacity: 0.4, shadowRadius: 10 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  switchText: { color: '#A295B3', textAlign: 'center', marginTop: 22, fontSize: 13, fontWeight: '700' },
  errorText: { color: '#FF3B30', textAlign: 'center', marginBottom: 14, fontSize: 13, fontWeight: '700' },

  mainContainer: { flex: 1, backgroundColor: '#0D0A12', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { height: 68, paddingHorizontal: 20, backgroundColor: '#15111E', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#231D30' },
  headerLogoGroup: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '900', letterSpacing: 2, color: '#FFFFFF', marginLeft: 10 },
  logoutBtnBadge: { backgroundColor: '#201A2C', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#312745' },
  logoutText: { color: '#FF5722', fontSize: 11, fontWeight: '800' },

  body: { flex: 1 },
  tabContent: { padding: 16 },
  tabContentHeader: { paddingHorizontal: 16, paddingTop: 10 },

  storiesContainer: { paddingVertical: 14, backgroundColor: '#15111E', borderBottomWidth: 1, borderBottomColor: '#231D30', marginBottom: 12 },
  storyItem: { alignItems: 'center', marginRight: 16 },
  addStoryItem: { alignItems: 'center', marginRight: 16 },
  addStoryCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#201A2C', borderWidth: 2.5, borderColor: '#00E5FF', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  storyRing: { width: 74, height: 74, borderRadius: 37, borderWidth: 2.5, borderColor: '#FF5722', padding: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  storyAvatar: { width: 64, height: 64, borderRadius: 32 },
  storyName: { color: '#C4B8D4', fontSize: 11, fontWeight: '700', maxWidth: 74, textAlign: 'center' },

  storyModalContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'space-between' },
  storyHeaderInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 15, paddingBottom: 10 },
  storyModalAvatarMini: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FF5722', justifyContent: 'center', alignItems: 'center' },
  storyModalAuthor: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  storyModalTime: { color: '#8C8296', fontSize: 11 },
  storyCloseBtn: { backgroundColor: 'rgba(255,255,255,0.2)', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  
  storyImageWrapper: { flex: 1, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  storyFullImage: { width: SCREEN_WIDTH, height: '100%' },
  bigHeartContainer: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  storyLikeOverlayBtn: { position: 'absolute', bottom: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignItems: 'center', flexDirection: 'row' },
  storyLikeCountText: { color: '#FFF', fontWeight: '800', marginLeft: 6, fontSize: 13 },

  storyCommentsSection: { paddingVertical: 6, backgroundColor: 'rgba(0,0,0,0.6)' },
  storyCommentBubble: { flexDirection: 'row', marginBottom: 4, paddingHorizontal: 16 },
  storyCommentAuthor: { color: '#00E5FF', fontSize: 12, fontWeight: '800' },
  storyCommentText: { color: '#FFF', fontSize: 12 },

  storyReplyBox: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 25, paddingTop: 10, alignItems: 'center', backgroundColor: '#0D0A12' },
  storyReplyInput: { flex: 1, backgroundColor: '#1E1829', borderWidth: 1, borderColor: '#2D253D', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, color: '#FFF', fontSize: 13, marginRight: 10 },
  storyReplySend: { backgroundColor: '#FF5722', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24 },

  sectionTitle: { fontSize: 12, fontWeight: '800', marginBottom: 12, color: '#A295B3', letterSpacing: 1.5, textTransform: 'uppercase' },
  filterRow: { flexDirection: 'row', marginBottom: 16 },
  filterChip: { backgroundColor: '#15111E', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#231D30' },
  filterChipActive: { backgroundColor: '#FF5722', borderColor: '#FF5722' },
  filterChipText: { color: '#A295B3', fontSize: 12, fontWeight: '700' },
  filterChipTextActive: { color: '#FFF' },

  createPostBox: { backgroundColor: '#15111E', padding: 18, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: '#231D30' },
  createPostInput: { minHeight: 65, fontSize: 14, color: '#FFF', textAlignVertical: 'top' },
  previewContainer: { position: 'relative', marginBottom: 12 },
  previewImage: { width: '100%', height: 180, borderRadius: 16 },
  removePreviewBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  removePreviewText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  pollCreatorBox: { backgroundColor: '#201A2C', padding: 12, borderRadius: 14, marginBottom: 10 },
  smallInput: { backgroundColor: '#0D0A12', borderWidth: 1, borderColor: '#2D253D', color: '#fff', padding: 12, borderRadius: 12, marginBottom: 10, fontSize: 13 },
  pollValidateBtn: { backgroundColor: '#00E5FF', padding: 10, borderRadius: 10, alignItems: 'center' },
  pollValidateText: { color: '#0D0A12', fontSize: 12, fontWeight: '800' },
  pollPreviewBadge: { backgroundColor: '#201A2C', padding: 12, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#312745' },
  pollPreviewTitle: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  pollPreviewOpts: { color: '#00E5FF', fontSize: 11, marginTop: 4 },
  musicBadgePreview: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#201A2C', padding: 10, borderRadius: 14, marginBottom: 10, alignItems: 'center' },
  musicBadgeText: { color: '#FFF', fontSize: 12 },
  inlineInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  inlineOkBtn: { backgroundColor: '#FF5722', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginLeft: 8 },
  createPostFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: '#231D30', paddingTop: 12 },
  toolsRow: { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },
  toolBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#201A2C', marginRight: 6, marginBottom: 4 },
  toolBtnActive: { backgroundColor: '#FF5722' },
  toolBtnText: { fontSize: 11, color: '#C4B8D4', fontWeight: '700' },
  postSubmitBtn: { backgroundColor: '#FF5722', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 16 },
  postSubmitText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  
  postCard: { backgroundColor: '#15111E', borderRadius: 24, marginHorizontal: 16, marginBottom: 16, padding: 18, borderWidth: 1, borderColor: '#231D30' },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
  postAvatarMini: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#00E5FF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  postAvatarMiniText: { color: '#0D0A12', fontSize: 14, fontWeight: '900' },
  postAuthor: { fontWeight: '800', color: '#FFF', fontSize: 14 },
  postTime: { color: '#8C8296', fontSize: 11 },
  postText: { fontSize: 14, color: '#F0ECF6', marginBottom: 12, lineHeight: 21 },
  postImage: { width: '100%', height: 260, borderRadius: 16, marginBottom: 12 },
  
  postInteractionsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#231D30', paddingTop: 12 },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 12, marginRight: 6, backgroundColor: '#201A2C', borderRadius: 12 },
  actionBtnText: { fontSize: 11, fontWeight: '700', color: '#A295B3' },
  likedText: { color: '#FF3B30' },

  mapMemberCard: { backgroundColor: '#15111E', padding: 18, borderRadius: 24, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#231D30' },
  mapDotOnline: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00E5FF', marginRight: 8 },
  gpsRouteBtn: { backgroundColor: '#201A2C', padding: 12, borderRadius: 14, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: '#312745' },
  gpsRouteBtnText: { color: '#00E5FF', fontSize: 12, fontWeight: '800' },

  addServiceBox: { backgroundColor: '#15111E', padding: 18, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: '#231D30' },
  addBtn: { backgroundColor: '#FF5722', padding: 14, borderRadius: 14, alignItems: 'center', marginTop: 4 },
  addBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  serviceCard: { backgroundColor: '#15111E', padding: 18, borderRadius: 24, marginHorizontal: 16, marginBottom: 14, borderWidth: 1, borderColor: '#231D30' },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  serviceTitle: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  servicePrice: { fontSize: 14, fontWeight: '900', color: '#00E5FF' },
  serviceAuthor: { fontSize: 11, color: '#A295B3', marginBottom: 8, fontWeight: '600' },
  serviceDesc: { fontSize: 13, color: '#D9D2E3', lineHeight: 18 },

  conversationCard: { flexDirection: 'row', backgroundColor: '#15111E', padding: 16, borderRadius: 24, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#231D30', marginHorizontal: 16 },
  conversationAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FF5722', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  conversationAvatarText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  conversationInfo: { flex: 1 },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  conversationName: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  conversationTime: { fontSize: 11, color: '#8C8296' },
  conversationLastMessage: { fontSize: 13, color: '#A295B3' },

  chatContainer: { flex: 1 },
  privateChatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#15111E', borderBottomWidth: 1, borderBottomColor: '#231D30' },
  backButton: { padding: 4 },
  backButtonText: { color: '#FF5722', fontSize: 13, fontWeight: '700' },
  privateChatTitle: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  msgBubble: { padding: 14, borderRadius: 18, marginBottom: 8, maxWidth: '80%' },
  msgMe: { backgroundColor: '#FF5722', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  msgOther: { backgroundColor: '#201A2C', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#312745' },
  msgTextMe: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  msgTextOther: { color: '#FFF', fontSize: 13 },
  msgTime: { fontSize: 9, alignSelf: 'flex-end', marginTop: 4 },
  timeMe: { color: 'rgba(255,255,255,0.7)' },
  timeOther: { color: '#8C8296' },
  chatInputRow: { flexDirection: 'row', backgroundColor: '#15111E', paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#231D30' },
  chatInput: { flex: 1, backgroundColor: '#0D0A12', borderWidth: 1, borderColor: '#2D253D', borderRadius: 22, fontSize: 13, color: '#fff', paddingVertical: 10, paddingHorizontal: 16, marginRight: 10 },
  sendButton: { backgroundColor: '#FF5722', borderRadius: 22, paddingHorizontal: 18, paddingVertical: 11 },
  sendButtonText: { color: '#FFF', fontWeight: '800', fontSize: 12 },

  profileBox: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  profileAvatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FF5722', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#FF5722', shadowOpacity: 0.5, shadowRadius: 12 },
  profileAvatarText: { color: '#FFF', fontSize: 34, fontWeight: '900' },
  profileName: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  profileBio: { color: '#A295B3', marginTop: 6, fontSize: 13, textAlign: 'center' },
  statusPill: { backgroundColor: '#201A2C', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, marginTop: 10, borderWidth: 1, borderColor: '#312745' },
  statusPillText: { color: '#00E5FF', fontSize: 12, fontWeight: '800' },
  secretModeToggle: { marginTop: 16, backgroundColor: '#201A2C', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 14, borderWidth: 1, borderColor: '#312745' },
  secretModeActive: { backgroundColor: '#FF3B30', borderColor: '#FF3B30' },
  secretModeText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  sectionTitleProfile: { fontSize: 13, fontWeight: '800', color: '#A295B3', textTransform: 'uppercase', marginTop: 30, marginBottom: 10, alignSelf: 'flex-start', paddingLeft: 16, letterSpacing: 1.5 },

  navbarWrapper: { backgroundColor: '#0D0A12', paddingBottom: 10 },
  navbar: { height: 64, backgroundColor: '#15111E', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#231D30', marginHorizontal: 12, borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: '#231D30' },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  navIcon: { fontSize: 16, opacity: 0.4 },
  navActive: { opacity: 1 },
  navText: { fontSize: 9, color: '#8C8296', marginTop: 3, fontWeight: '700' },
  navActiveText: { color: '#FF5722', fontWeight: '900' },
  badgeDot: { position: 'absolute', top: 4, right: 14, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FF3B30' }
});