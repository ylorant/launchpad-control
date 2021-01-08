export default {
    api: {
        host: 'http://' + window.location.hostname + ':8080'
    },
    listener: {
        hubUrl: "http://127.0.0.1:8082/.well-known/mercure",
        topic: "launchpad"
    }
};