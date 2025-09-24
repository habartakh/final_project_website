let vueApp = new Vue({
    el: "#vueApp",
    data: {
        // ros connection
        ros: null,
        rosbridge_address: 'wss://i-073a241deadcb1a33.robotigniteacademy.com/c0b97d42-8efd-4271-aa59-89a1b9d39f2b/rosbridge/',
        connected: false,
        // page content
        menu_title: 'Connection',
        main_title: 'Main title, from Vue!!',
    },
    methods: {
        connect: function() {
            // define ROSBridge connection object
            this.ros = new ROSLIB.Ros({
                url: this.rosbridge_address
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
        sendCommand: function() {

            console.log("Send action goal!")
            // Create Action Client
            let actionClient = new ROSLIB.ActionClient({
            ros: this.ros,
            serverName: '/set_joint_values',  
            actionName: 'moveit2_scripts/action/SetJointValues'  
            })

            let goalMessage = {
                joint_values: [0.245, -2.674, -1.915, -0.834, 2.821, -0.491]
            }

            let goal = new ROSLIB.Goal({
                actionClient: actionClient,
                goalMessage: goalMessage
            })

            goal.on('feedback', function (feedback) {
                console.log('Feedback:', feedback);
            })

            goal.on('result', function (result) {
                console.log('Final result:', result);
                alert('Success: ' + result.success + '\nMessage: ' + result.message);
            })

            goal.send()
           
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
                topic: '/D415/color/image_raw',
                ssl: true,
            })
        },
    },
    mounted() {
        // page is ready
        console.log('page is ready!')
    },
})