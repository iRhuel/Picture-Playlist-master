import React, {Component} from 'react';
import Clarifai from 'clarifai';
import axios from 'axios';

class App extends Component {
    constructor(props) {
        super(props);

        // inside of our state object, we set our API keys in order to get data from the APIs
        this.state = {
            clarifaiKey: 'b152ab226db545d7ae11f33a8756cda5',
            mashapeKey: '8T7epZZomNmshvkB0xHh8YgIgUhnp1mbZ8RjsnqijKFCpgCBCc',
            inputURL: '',
            tracks: [],
            urls: []
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleOnClick = this.handleOnClick.bind(this);
        this.handleAddClick = this.handleAddClick.bind(this);
    }

    handleOnClick() {
        this.getImageDetails(this.state.urls)
            .then((imageDetails) => {
            let keyword = imageDetails.outputs[0].data.concepts[0].name;
            this.getMusicTerms(keyword);


        })
    }

    handleChange(e) {
        this.setState({
            inputURL: e.target.value
        })
    }

    handleAddClick() {
        let temp = Object.assign([], this.state.urls);
        temp.push(this.state.inputURL);
        this.setState({
            urls: temp
        });
        console.log(this.state.urls);
    }

    componentDidMount() {

        /* Use Clarifai to grab image details */
        this.getImageDetails().then((imageDetails) => {

            /* Find all the terms inside image details */
            console.log('Image details from Clarifai', imageDetails);

            /* After, querying for words associated with an image, query those top 5 terms for songs */
            this.getMusicTerms();
        });
    }

    getImageDetails(images) {

        //images we are going to send to the api to get terms for
        // var images = [
        //     'http://miriadna.com/desctopwalls/images/max/Wet-sand.jpg'
        // ];

        //instantiate a new Clarifai app passing in your api key.
        const app = new Clarifai.App({apiKey: this.state.clarifaiKey});

        // predict the contents of an image by passing in a url
        return new Promise((res, rej) => {
            app.models.predict(Clarifai.GENERAL_MODEL, images)
                .then((response) => {
                    res(response);
                })
                .catch(err => rej(err));
        });
    }

    getMusicTerms(query) {
        //using the image terms, make a query

        axios({
            method: 'get',
            url: 'https://musixmatchcom-musixmatch.p.mashape.com/wsr/1.1/track.search?f_has_lyrics=1&page=1&page_size=5&q_track=' + query + '&s_track_rating=desc',
            headers: {
                'X-Mashape-Key': `${this.state.mashapeKey}`,
                'accept': 'application/json'
            }
        }).then((res) => {
            console.log('Terms from Music Match API', res);

            let songNames = [];
            for (let i = 0; i < res.data.length; i++) {
                songNames.push(res.data[i].track_name);
            }
            this.setState({
                tracks: songNames
            });
        }).catch(err => console.log(err));
    }

    render() {
        return (
            <div className="App container">
                <div className="App-header">
                    <h2>Image to Music Converter</h2>
                </div>
                <p className="App-intro">
                    To get started, edit <code>src/App.js</code> and save to reload.
                </p>
                <input type='text' onChange={this.handleChange} className='text-input'/>
                <button onClick={this.handleOnClick} className='btn btn-confirm'>Analyze</button>
                <button onClick={this.handleAddClick}>ADD</button>
                <ul className='output'>{this.state.tracks.map((track, index) =>
                    <li key={index}>
                        {track}
                    </li>
                )}
                </ul>
            </div>
        );
    }


}

export default App;
