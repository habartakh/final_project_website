let vueApp = new Vue({
    el: "#vueApp",
    data: {
        // ros connection
        ros: null,
        rosbridge_address: 'wss://i-0a88208c3b598c5ed.robotigniteacademy.com/114106dc-aa31-491e-9289-4aee78d51236/rosbridge/',
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
            })
            this.ros.on('error', (error) => {
                console.log('Something went wrong when trying to connect')
                console.log(error)
            })
            this.ros.on('close', () => {
                this.connected = false
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
        sendTurnRightCommand: function() {
            let topic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/fastbot/cmd_vel',
                messageType: 'geometry_msgs/Twist'
            })
            let message = new ROSLIB.Message({
                linear: { x: 0.0, y: 0, z: 0, },
                angular: { x: 0, y: 0, z: -0.2, },
            })
            topic.publish(message)
        },
        sendStopCommand: function() {
            let topic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/fastbot/cmd_vel',
                messageType: 'geometry_msgs/Twist'
            })
            let message = new ROSLIB.Message({
                linear: { x: 0.0, y: 0, z: 0, },
                angular: { x: 0, y: 0, z: 0.0, },
            })
            topic.publish(message)
        },
    },
    mounted() {
        // page is ready
        console.log('page is ready!')
    },
})