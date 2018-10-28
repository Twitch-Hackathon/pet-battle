import React from 'react'
import Authentication from '../../util/Authentication/Authentication'

import './App.css'

import kappaAvatar from '../../../public/kappa.png';

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
            bossName: 'Raid Boss',
            bossAvatar: 'https://static-cdn.jtvnw.net/emoticons/v1/973/3.0',
            bossMaxHP: 100,
            bossHP: 100
        }

        this.doDamage = this.doDamage.bind(this);
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
    }

    componentWillUnmount(){
        if(this.twitch){
            this.twitch.unlisten('broadcast', ()=>console.log('successfully unlistened'))
        }
    }
   
    doDamage(){
        let {bossHP} = this.state;
        bossHP -= 10;
        if(bossHP > 0) {
            this.setState({bossHP});
        } else {
            this.generateBoss();
        }
    }

    generateBoss(){
        const emotes = ['https://static-cdn.jtvnw.net/emoticons/v1/33/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/973/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/22639/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/86/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/4057/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/111700/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/4339/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/360/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/357/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/25/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/41/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/425618/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/58765/3.0', 'https://static-cdn.jtvnw.net/emoticons/v1/88/3.0'];
        const bossAvatar = emotes[Math.floor(Math.random()*14)];
        const bossMaxHP = this.state.bossMaxHP + 100;
        const bossHP = bossMaxHP;
        this.setState({bossAvatar, bossHP, bossMaxHP});
    }

    render(){

        if(this.state.finishedLoading && this.state.isVisible){
            return (
                <div className="App raid-boss-container">
                    <div className="raid-boss-header">
                        {this.state.bossName}
                    </div>
                    <img onClick={this.doDamage} className="raid-boss-avatar" src={this.state.bossAvatar}/>
                    <div className="raid-boss-hp">
                        HP: {this.state.bossHP}
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