import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, FlatList, Button } from 'react-native';
// import Firestore
const firebase = require('firebase');
require('firebase/firestore');

export default class App extends React.Component {

  constructor() {
    super();
    this.state = {
      lists: [],
      uid: 0,
      loggedInText: 'Please wait, you are getting logged in',
    };

    const firebaseConfig = {
      apiKey: "AIzaSyAv32VWewXrMup-cRjJnxvQ_ZZiz8N_6uk",
      authDomain: "chatapp-c0a0d.firebaseapp.com",
      projectId: "chatapp-c0a0d",
      storageBucket: "chatapp-c0a0d.appspot.com",
      messagingSenderId: "1022347094695",
      appId: "1:1022347094695:web:25f32ca6a4c739bca24982",
      measurementId: "G-8R3H32XG2F"
    };
    if (!firebase.apps.length){
      firebase.initializeApp(firebaseConfig);
    }
    this.referenceShoppingLists = firebase.firestore().collection('shoppinglists');
  }

  componentDidMount() {
    this.referenceShoppingLists = firebase.firestore().collection('shoppinglists');

    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        await firebase.auth().signInAnonymously();
      }
    
      //update user state with currently active user data
      this.setState({
        uid: user.uid,
        loggedInText: 'Hello there',
      });
      // create a reference to the active user's documents (shopping lists)
      this.referenceShoppinglistUser = firebase.firestore().collection('shoppinglists').where("uid", "==", this.state.uid);
      // listen for collection changes for current user 
      this.unsubscribeListUser = this.referenceShoppinglistUser.onSnapshot(this.onCollectionUpdate);
    });
  }

  onCollectionUpdate = (querySnapshot) => {
    const lists = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      var data = doc.data();
      lists.push({
        name: data.name,
        items: data.items.toString(),
      });
    });
    this.setState({
      lists,
    });
  };

  addList() {
    // add a new list to the collection
    this.referenceShoppingLists.add({
      name: 'TestList',
      items: ['eggs', 'pasta', 'veggies'],
      uid: this.state.uid,
    });
  }

  componentWillUnmount() {
    // stop listening to authentication
    this.unsubscribe();
     // stop listening for changes
     this.unsubscribeListUser();
  }

  render(){
    return (
      <View style={styles.container}>
        <Text>{this.state.loggedInText}</Text>
        <Text style={styles.text}>All Shopping lists</Text>
        <FlatList
          data={this.state.lists}
          renderItem={({ item }) =>
          <Text>{item.name}: {item.items}</Text>}
        />
        <Button onPress={()=>{this.addList();
        }}
        title= "Add something"/>
      </View>
    );
  }
  
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: 'center',
      paddingTop: 40,     
    },
      item: {
      fontSize: 20,
      color: 'blue',
    },
      text: {
      fontSize: 30,
  },
});
