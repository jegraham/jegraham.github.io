import React, {Component} from 'react';
import { Text, View } from 'react-native';
import fetch from "node-fetch";
import CONFIG from "../config";

class ProjectApi{

    static async getProjects(){
        let ep = CONFIG.URL + "/projects";
        try{
            let response = await fetch(ep);
            if(response.status !== 200){
                throw Error("Failed to get projects")
            }
            let json = await response.json();
            return json;
        }
        catch(error){
            throw Error(error.message);
        }
    }
}

export default ProjectApi;


export default class Request extends Component {
    state={
    };

    constructor(props) {
        super(props)
    }

    static propTypes = {
    };

    componentDidMount() {
    }

    render() {
        return (
            <View
                style={styles.style}>
                <Text>Hello</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    style: {
    },
});
