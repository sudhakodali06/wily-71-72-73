import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, KeyboardAvoidingView, ToastAndroid, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../config';

export default class TransactionScreen73 extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal'
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        //status === "granted" is true when user has granted permission
          //status === "granted" is false when user has not granted the permission
        
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }

    checkBookAvailability = async()=>{
        const bookRef = await db.collection("books").where('bookId','==',this.state.scannedBookId).get();
        console.log("check book availability", this.state.scannedBookId)
        var transactionType = "";
        if(bookRef.docs.length == 0){
            transactionType = false;
        }
        else{
            bookRef.docs.map(doc=>{
                var book = doc.data();
                if(book.bookAvailability){
                    transactionType = "Issue"
                }
                else{
                    transactionType = "Return"
                }
            })
        }

        return transactionType;
    }

    handleTransaction = async()=>{
     ;
      var transactionType = await this.checkBookAvailability()//false/issue/return
      console.log("transaction type: "+transactionType)

      if(!transactionType){
        Alert.alert("Book doesnt exist the database");
        this.setState({
          scannedBookId:'',
          scannedStudentId:''
        })
      }
      else if(transactionType === "Issue"){
        var isStudentEligible = await this.checkStudentEligibilityForBookIssue()//true/false/isssue
        console.log("is student eligiblke for issue", isStudentEligible)
        if(isStudentEligible){
            this.initiateBookIssue();
            Alert.alert("Book issued to the student");
        }      
      }
      else{
        var isStudentEligible = await this.checkStudentEligibilityForBookReturn()
        console.log("is student eligiblke for return", isStudentEligible)
        if(isStudentEligible){
          this.initiateBookReturn();
          Alert.alert("Book returned to the library")
        }
      }

    }

    checkStudentEligibilityForBookIssue = async()=>{
        const studentRef = await db.collection("students").where("studentId","==",this.state.scannedStudentId).get()
        var isStudentEligible = "";
        if(studentRef.docs.length==0){
            isStudentEligible = false;
            this.setState({
                scannedStudentId : '',
                scannedBookId: ''
            })
            Alert.alert("Student does not exist in database");
        }
        else{
            studentRef.docs.map(doc=>{
                var student = doc.data();
                if(student.numberOfBooksIssued <2){
                    isStudentEligible = true;
                }
                else{
                    isStudentEligible = false;
                    Alert.alert("Student has already issued 2 books");
                    this.setState({
                        scannedStudentId : '',
                        scannedBookId: ''
                    })
                }
            })
        }
        return isStudentEligible;
    }

    checkStudentEligibilityForBookReturn = async()=>{
        const transactionRef = db.collection("transactions").where("bookId","==",this.state.scannedBookId).limit(1).get();
        console.log("transaction ref for return", tra)
        isStudentEligible  = "";
        transactionRef.docs.map(doc=>{
            var lastBookTransaction = doc.data();
            if(lastBookTransaction.studentId === this.state.scannedStudentId){
                isStudentEligible = true;
            }
            else{
                isStudentEligible = false;
                Alert.alert("Book wasn't issued by the student")
                /*this.setState({
                    scannedStudentId : '',
                    scannedBookId: ''
                })*/
            }
        })
        return isStudentEligible;
    }

    initiateBookIssue = () => {
        //add a transaction
        db.collection("transactions").add({
        'studentId' : this.state.scannedStudentId,
        'bookId' : this.state.scannedBookId,
        'data' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType' : "Issue"
        })

        //change book status
        db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability' : false
        })
        //change number of issued books for student
        db.collection("students").doc(this.state.scannedStudentId).update({
        'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(1)
        })
Alert.alert("book issued")
        this.setState({
        scannedStudentId : '',
        scannedBookId: ''
        })
    };
  
    initiateBookReturn = () => {
        //add a transaction
        db.collection("transactions").add({
        'studentId' : this.state.scannedStudentId,
        'bookId' : this.state.scannedBookId,
        'date'   : firebase.firestore.Timestamp.now().toDate(),
        'transactionType' : "Return"
        })

        //change book status
        db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability' : true
        })

        //change book status
        db.collection("students").doc(this.state.scannedStudentId).update({
        'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(-1)
        })

        this.setState({
        scannedStudentId : '',
        scannedBookId : ''
        })
    };
  

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText={text=>this.setState({scannedBookId:text})}
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText={text=>this.setState({scannedStudentId:text})}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={
              async()=>{
                console.log("student--", this.state.scannedStudentId)
                console.log("book -- ", this.state.scannedBookId)
                this.handleTransaction()
                
                }}>
              <Text style={styles.buttonText}>SUBMIT</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10     
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10,      
      fontWeight:"bold"
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
      backgroundColor:"orange",
      width:200,
      height:50
    }
  });