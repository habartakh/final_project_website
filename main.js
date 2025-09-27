let vueApp = new Vue({
    el: "#vueApp",
    data: {
        // ros connection
        ros: null,
        rosbridge_address: 'wss://i-013742bf516764eb5.robotigniteacademy.com/6127e1a7-6d6f-4851-bf29-f4d3b2632ef4/rosbridge/',
        connected: false,
        // page content
        menu_title: 'Connection',
        main_title: 'Main title, from Vue!!',
         // 3D Model
        viewer: null,
        tfClient: null,
        urdfClient: null,
        //Progress bar
        progress: 0,
        showProgressBar: false,
        trajectoryStarted: false,

    },
    methods: {
        connect: function() {
            // define ROSBridge connection object
            this.ros = new ROSLIB.Ros({
                url: this.rosbridge_address,
                timeout : 120000, //120s
                groovyCompatibility: false //! IMPORTANT: Cannot visualize the robot without it!
            })

            // define callbacks
            this.ros.on('connection', () => {
                this.connected = true
                console.log('Connection to ROSBridge established!')

                // Camera Setup
                this.setCamera()

                // Do not display progress bar until robot starts moving
                // document.getElementById('progress').innerHTML = ''

                // Setup 3D Viewer
                this.setup3DViewer()

                // Subscribe to progress topic  
                this.subscribeToProgress();
            })
            this.ros.on('error', (error) => {
                console.log('Something went wrong when trying to connect')
                console.log(error)
            })
            this.ros.on('close', () => {
                this.connected = false

                // Do not display the Camera div on the webpage when disconnected 
                document.getElementById('divCamera').innerHTML = ''

                // document.getElementById('progress').innerHTML = ''

                this.unset3DViewer()

                console.log('Connection to ROSBridge was closed!')
            })
        },
        disconnect: function() {
            this.ros.close()
        },
        startTrajectory: function() {
            
            // Publish start signal to move arm and start calibration
            let topic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/start_signal_topic',
                messageType: 'std_msgs/Bool'
            })
            let message = new ROSLIB.Message({
                data : true
            })
            topic.publish(message) 

            this.trajectoryStarted = true;
            this.progress = 0;
            this.showProgressBar = true;
             
                 
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

        setup3DViewer() {
            this.viewer = new ROS3D.Viewer({
                background: '#cccccc',
                divID: 'div3DViewer',
                width: 350,
                height: 320,
                antialias: true,
                fixedFrame: 'base_link'
            })

            // Add a grid.
            this.viewer.addObject(new ROS3D.Grid({
                color:'#0181c4',
                cellSize: 0.5,
                num_cells: 20
            }))

            // Setup a client to listen to TFs.
            this.tfClient = new ROSLIB.TFClient({
                ros: this.ros,
                angularThres: 0.01,
                transThres: 0.01,
                rate: 10.0,
                fixedFrame: 'base_link'
            })

            // Setup the URDF client.
            this.urdfClient = new ROS3D.UrdfClient({
                ros: this.ros,
                param: '/robot_state_publisher:robot_description',
                tfClient: this.tfClient,
                // We use "path: location.origin + location.pathname"
                // instead of "path: window.location.href" to remove query params,
                // otherwise the assets fail to load
                path: location.origin + location.pathname,
                rootObject: this.viewer.scene,
                loader: ROS3D.COLLADA_LOADER_2
            })
        },
        unset3DViewer() {
            document.getElementById('div3DViewer').innerHTML = ''
        },

        // Update Progress
        subscribeToProgress() {
            const progressTopic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/trajectory_progress', 
                messageType: 'std_msgs/Int16',
            });

            progressTopic.subscribe((message) => {
                if (!this.trajectoryStarted) return;

                this.progress =message.data;

                // Wait until the robot completes the rotations for its final pose : progress = 100%
                // Then, publish a progress > 100 that will close the progress bar 
                if (this.progress > 100) {
                    this.showProgressBar = false;
                    this.trajectoryStarted = false;
                }
            });
        },
    },
    mounted() {
        // page is ready
        console.log('page is ready!')
    },
})