import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from './src/supabase';

const BRAND = '#123B55';

function Action({ title, onPress, secondary=false }) {
  return <TouchableOpacity onPress={onPress} style={[styles.button, secondary && styles.secondary]}>
    <Text style={[styles.buttonText, secondary && styles.secondaryText]}>{title}</Text>
  </TouchableOpacity>;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadProfile(data.session.user.id);
      else setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) loadProfile(next.user.id);
      else { setProfile(null); setLoading(false); }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
    const { data, error } = await supabase.from('profiles')
      .select('id,email,full_name,role,can_view_finances')
      .eq('id', userId).single();
    if (error) Alert.alert('Profile', error.message);
    setProfile(data || null);
    setLoading(false);
  }

  async function signIn() {
    if (!supabase) return Alert.alert('Setup needed', 'Please add your Supabase URL and publishable key in the project environment.');
    if (!email.trim() || !password) return Alert.alert('Missing details', 'Enter your email and password.');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) Alert.alert('Sign in failed', error.message);
    setLoading(false);
  }

  async function resetPassword() {
    if (!supabase || !email.trim()) return Alert.alert('Email required', 'Enter your email first.');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    Alert.alert(error ? 'Could not send link' : 'Check your email', error ? error.message : 'Password reset link requested.');
  }

  async function signOut() { await supabase.auth.signOut(); }

  const role = profile?.role || 'employee';
  const roleTitle = role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : role.charAt(0).toUpperCase() + role.slice(1);

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color={BRAND}/><Text style={styles.muted}>Loading AL MASLAMANI…</Text></SafeAreaView>;

  if (!supabase) return <SafeAreaView style={styles.center}>
    <Text style={styles.logo}>AL MASLAMANI</Text><Text style={styles.heading}>Project setup required</Text>
    <Text style={styles.copy}>Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to the Expo environment. Never add a service_role key to a mobile app.</Text>
  </SafeAreaView>;

  if (!session) return <SafeAreaView style={styles.container}>
    <StatusBar style="light"/>
    <View style={styles.hero}><Text style={styles.logo}>AL MASLAMANI</Text><Text style={styles.sub}>FOR SERVICES & MAINTENANCE</Text></View>
    <View style={styles.panel}><Text style={styles.heading}>Sign in</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email address" autoCapitalize="none" keyboardType="email-address"/>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry/>
      <Action title="Sign in" onPress={signIn}/>
      <Action title="Forgot password?" secondary onPress={resetPassword}/>
    </View>
    <Text style={styles.footer}>Private company app · QAR</Text>
  </SafeAreaView>;

  return <SafeAreaView style={styles.container}>
    <StatusBar style="light"/>
    <View style={styles.hero}><Text style={styles.logo}>AL MASLAMANI</Text><Text style={styles.sub}>FOR SERVICES & MAINTENANCE</Text></View>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}</Text>
      <Text style={styles.role}>{roleTitle} Dashboard</Text>
      <View style={styles.card}><Text style={styles.cardTitle}>Your account</Text><Text style={styles.copy}>{profile?.email || session.user.email}</Text><Text style={styles.copy}>Role: {roleTitle}</Text></View>
      {role === 'super_admin' || role === 'admin' ? <>
        <Text style={styles.section}>Management</Text>
        <View style={styles.tile}><Text style={styles.tileTitle}>Customers</Text><Text style={styles.copy}>Customer management will be connected in the next development stage.</Text></View>
        <View style={styles.tile}><Text style={styles.tileTitle}>Jobs & Services</Text><Text style={styles.copy}>Departments, services and job assignments.</Text></View>
        {profile?.can_view_finances || role === 'super_admin' ? <View style={styles.tile}><Text style={styles.tileTitle}>Finance</Text><Text style={styles.copy}>Finance access is restricted by account permissions.</Text></View> : null}
      </> : role === 'driver' ? <>
        <Text style={styles.section}>Driver essentials</Text>
        <View style={styles.tile}><Text style={styles.tileTitle}>Assigned work</Text><Text style={styles.copy}>Assigned jobs, trip records and fuel expenses.</Text></View>
      </> : <>
        <Text style={styles.section}>My work</Text>
        <View style={styles.tile}><Text style={styles.tileTitle}>Assigned jobs</Text><Text style={styles.copy}>Your assigned work and daily reports.</Text></View>
        <View style={styles.tile}><Text style={styles.tileTitle}>Attendance</Text><Text style={styles.copy}>Attendance and work reporting.</Text></View>
      </>}
      <Action title="Sign out" onPress={signOut} secondary/>
      <Text style={styles.footer}>This is the initial mobile foundation. Operational screens and workflows still need implementation and testing.</Text>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#F3F6F8'}, center:{flex:1,justifyContent:'center',alignItems:'center',padding:28,backgroundColor:'#F3F6F8'},
  hero:{backgroundColor:BRAND,padding:28,paddingTop:44}, logo:{fontSize:25,fontWeight:'800',color:'#fff',letterSpacing:1},
  sub:{fontSize:11,color:'#D7E6EF',marginTop:5,letterSpacing:1.4}, panel:{margin:20,padding:20,backgroundColor:'#fff',borderRadius:16,elevation:2},
  heading:{fontSize:23,fontWeight:'700',color:'#173448',marginBottom:14}, input:{borderWidth:1,borderColor:'#D8E0E5',borderRadius:10,padding:14,marginBottom:12,fontSize:16,backgroundColor:'#fff'},
  button:{backgroundColor:BRAND,padding:15,borderRadius:10,alignItems:'center',marginTop:8},buttonText:{color:'#fff',fontWeight:'700',fontSize:16},
  secondary:{backgroundColor:'#E8EEF2'},secondaryText:{color:BRAND},footer:{textAlign:'center',color:'#71808A',fontSize:12,margin:22,lineHeight:18},
  content:{padding:20},muted:{color:'#667780',marginTop:12},role:{color:'#537080',fontSize:15,marginBottom:18},
  card:{backgroundColor:'#fff',padding:18,borderRadius:14,marginBottom:18},cardTitle:{fontWeight:'700',fontSize:16,color:'#173448',marginBottom:8},
  copy:{color:'#61717B',lineHeight:20},section:{fontWeight:'700',fontSize:18,color:'#173448',marginBottom:10,marginTop:6},
  tile:{backgroundColor:'#fff',padding:16,borderRadius:12,marginBottom:10},tileTitle:{fontWeight:'700',fontSize:16,color:'#173448',marginBottom:5}
});
