
import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import TransactionScreen  from './screens/BookTransactionScreen';
import TransactionScreen73 from './screens/class73Transaction';
import SearchScreen from './screens/SearchScreen';
import {createAppContainer} from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';

export default class App extends React.Component {
  render(){
  return (
   
     
      <AppContainer />
    
  );
  }
}

const TabNavigator = createBottomTabNavigator({
  Transaction:{screen:TransactionScreen73},
  Search:{screen:SearchScreen}
},
{
  defaultNavigationOptions:({navigation})=>({
    tabBarIcon:({})=>{
      const routeName = navigation.state.routeName;
      
      if(routeName === 'Transaction'){
        return(
          <Image source={require('./assets/transaction.png')} style={{width:40, height:40}} />
        )
      }
     else if(routeName === 'Search'){
        return(
          <Image source={require('./assets/searchingbook.png')} style={{width:40, height:40}} />
  
        )
      }
    }
  })
})

const AppContainer = createAppContainer(TabNavigator);


