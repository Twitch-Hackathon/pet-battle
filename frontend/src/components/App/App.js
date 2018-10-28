import React from 'react'
import axios from 'axios'
import openSocket from 'socket.io-client';

import Authentication from '../../util/Authentication/Authentication'

import './App.css'

const socket = openSocket('http://localhost:8888');

export default class App extends React.Component{
    constructor(props){
        super(props)
        this.Authentication = new Authentication()

        //if the extension is running on twitch or dev rig, set the shorthand here. otherwise, set to null.
        this.twitch = window.Twitch ? window.Twitch.ext : null
        this.state={
            finishedLoading:false,
            theme:'light',
            isVisible:true,
            channelId: null,
            health: 0,
            emote: '',
            shake: false,
            dead: false,
            subName: '',
            showSub: false
        }

        this.doDamage = this.doDamage.bind(this);

        document.body.addEventListener("onContext1", doSomething, false);

        function doSomething(e) {
            alert("Event is called: " + e.type);
        }
    }

    contextUpdate(context, delta){
        if(delta.includes('theme')){
            this.setState(()=>{
                return {theme:context.theme}
            })
        }
    }

    visibilityChanged(isVisible){
        this.setState(()=>{
            return {
                isVisible
            }
        })
    }

    componentDidMount(){
        if(this.twitch){
            this.twitch.onAuthorized((auth)=>{
                this.Authentication.setToken(auth.token, auth.userId)
                this.setState({channelId: auth.channelId, userId: auth.userId})

                axios.post('http://localhost:5000/pet',{userId: auth.userId}).then((res) => {
                    console.log("returned");
                }).catch((err) => {
                    console.error(err);
                });
                axios.post('http://localhost:5000/boss',{channelId: this.state.channelId})
                .then((res) => {
                    // console.log("data:", res);
                    this.setState({
                        health: res.data.health
                    });
                })


                if(!this.state.finishedLoading){
                    // if the component hasn't finished loading (as in we've not set up after getting a token), let's set it up now.

                    // now we've done the setup for the component, let's set the state to true to force a rerender with the correct data.
                    this.setState(()=>{
                        return {finishedLoading:true}
                    })
                }
            })

            this.twitch.listen('broadcast',(target,contentType,body)=>{
                this.twitch.rig.log(`New PubSub message!\n${target}\n${contentType}\n${body}`)
                // now that you've got a listener, do something with the result...

                // do something...

            })

            this.twitch.onVisibilityChanged((isVisible,_c)=>{
                this.visibilityChanged(isVisible)
            })

            this.twitch.onContext((context,delta)=>{
                this.contextUpdate(context,delta)
            })
        }

        this.generateEmote();
        socket.on('levelup', (res) =>{
            this.setState({health: res.health});
            this.genName();
            this.setState({showSub: true});
        })

    }

    componentWillUnmount(){
        if(this.twitch){
            this.twitch.unlisten('broadcast', ()=>console.log('successfully unlistened'))
        }
    }

    generateEmote(){
        const emotes = ['https://static-cdn.jtvnw.net/emoticons/v1/33/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/973/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/22639/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/86/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/4057/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/111700/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/4339/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/360/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/357/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/25/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/41/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/425618/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/58765/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/88/3.0'];
        const emote = emotes[Math.floor(Math.random()*14)];
        this.setState({emote});
    }

    doDamage(){
        socket.emit('attack', this.state.userId, this.state.channelId);
        socket.on('attack', (res)=>
            this.setState({health: res.health})
        )

        this.setState({shake:true});
        if(this.state.health <= 10){
            this.setState({dead:true});
            setTimeout(() => {
                this.generateEmote();
            }, 500)
        }
    }

    genName(){
        const names = ['pay79', 'new678', 'fish08', 'tai64', 'mai97', 'guy00', 'sir16', 'kay73'];
        const subName = names[Math.floor(Math.random()*names.length)]
        this.setState({subName})
    }

    render(){

        let currentAnimation = '';
        let newSub = '';

        if(this.state.dead){
            currentAnimation = "raid-boss-avatar dead"
        } else if(this.state.shake){
            currentAnimation = "raid-boss-avatar shake";
        } else {
            currentAnimation = "raid-boss-avatar";
        }

        if(!this.state.showSub){
            newSub = 'sub-notification hidden'
        } else {
            newSub = 'sub-notification'
            setTimeout( () => {
                this.setState({showSub:false});
            }, 2000);
        }

        if(this.state.finishedLoading && this.state.isVisible){
            return (
                <div className="App raid-boss-container">
                    <div className="raid-boss-header">
                        RAID BOSS
                    </div>
                    <img onClick={this.doDamage} className={currentAnimation} onAnimationEnd={() => this.setState({shake: false, dead: false})} src={this.state.emote}/>
                    <p className={newSub}>{this.state.subName} Subscribed!</p>
                    <div className="raid-boss-hp">
                        HP: {this.state.health}
                    </div>
                </div>
            )
        }else{
            return (
                <div className="App">
                </div>
            )
        }

    }
}
