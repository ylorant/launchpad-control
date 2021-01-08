class EventListener extends EventTarget
{
    constructor(hubUrl, topic)
    {
        super();

        let url = new URL(hubUrl);
        url.searchParams.append('topic', topic);

        this.eventSource = new EventSource(url);
        this.eventSource.onmessage = this.onMessageReceived.bind(this);
    }

    onMessageReceived(e)
    {
        let evData = JSON.parse(e.data);
        let ev = new Event(evData.type);
        ev.params = evData.params;
        this.dispatchEvent(ev);
    }

    on(ev, callback, options)
    {
        return this.addEventListener(ev, callback, options);
    }
}

export default EventListener;