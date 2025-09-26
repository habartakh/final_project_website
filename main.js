let vueApp = new Vue({
    el: "#vueApp",
    data: {
        // ros connection
        ros: null,
        rosbridge_address: 'wss://i-0e982784cfb267681.robotigniteacademy.com/a45a094c-f050-48f8-a8db-4aeeb4b1c53a/rosbridge/',
        connected: false,
        // page content
        menu_title: 'Connection',
        main_title: 'Main title, from Vue!!',
    },
    methods: {
        connect: function() {
            // define ROSBridge connection object
            this.ros = new ROSLIB.Ros({
                url: this.rosbridge_address,
                timeout : 120000 //120s
            })

            // define callbacks
            this.ros.on('connection', () => {
                this.connected = true
                console.log('Connection to ROSBridge established!')

                // Camera Setup
                this.setCamera()
            })
            this.ros.on('error', (error) => {
                console.log('Something went wrong when trying to connect')
                console.log(error)
            })
            this.ros.on('close', () => {
                this.connected = false

                // Do not display the Camera div on the webpage when disconnected 
                document.getElementById('divCamera').innerHTML = ''

                console.log('Connection to ROSBridge was closed!')
            })
        },
        disconnect: function() {
            this.ros.close()
        },
        startTrajectory: function() {
            
            let topic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/start_signal_topic',
                messageType: 'std_msgs/Bool'
            })
            let message = new ROSLIB.Message({
                data : true
            })
            topic.publish(message)     
        },

        setCamera: function() {
            let without_wss = this.rosbridge_address.split('wss://')[1]
            console.log(without_wss)
            let domain = without_wss.split('/')[0] + '/' + without_wss.split('/')[1]
            console.log(domain)
            let host = domain 
            //let host = domain + '/cameras'
            let viewer = new MJPEGCANVAS.Viewer({
                divID: 'divCamera',
                host: host,
                width: 320,
                height: 240,
                topic: '/aruco/image_marked',
                ssl: true,
            })
        },
    },
    mounted() {
        // page is ready
        console.log('page is ready!')
    },
})