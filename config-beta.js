/* eslint-disable */
var subdomain = "";
if (subdomain) {
    subdomain = subdomain.substr(0,subdomain.length-1).split('.').join('_').toLowerCase() + '.';
}
var config = {
    hosts: {
        domain: 'beta.meet.jit.si',

        muc: 'conference.'+subdomain+'beta.meet.jit.si', // FIXME: use XEP-0030
        focus: 'focus.beta.meet.jit.si',
    },
    disableSimulcast: false,
    enableRemb: true,
    enableTcc: true,
    resolution: 720,
    constraints: {
        video: {
            height: {
                ideal: 720,
                max: 720,
                min: 180
            },
            width: {
                ideal: 1280,
                max: 1280,
                min: 320
            }
        }
    },
    analytics: {
        whiteListedEvents: [ 'conference.joined', 'page.reload.scheduled', 'rejoined', 'transport.stats' ],
    },
    enableP2P: true, // flag to control P2P connections
    // New P2P options
    p2p: {
        enabled: true,
        preferH264: true,
        disableH264: true,
        useStunTurn: true // use XEP-0215 to fetch STUN and TURN servers for the P2P connection
    },
    useStunTurn: true, // use XEP-0215 to fetch TURN servers for the JVB connection
    useIPv6: false, // ipv6 support. use at your own risk
    useNicks: false,
    bosh: '//beta.meet.jit.si/http-bind', // FIXME: use xep-0156 for that
    websocket: 'wss://beta.meet.jit.si/xmpp-websocket', // FIXME: use xep-0156 for that


    clientNode: 'http://jitsi.org/jitsimeet', // The name of client node advertised in XEP-0115 'c' stanza
    //deprecated desktop sharing settings, included only because older version of jitsi-meet require them
    desktopSharing: 'ext', // Desktop sharing method. Can be set to 'ext', 'webrtc' or false to disable.
    chromeExtensionId: 'kglhbbefdnlheedjiejgomgmfplipfeb', // Id of desktop streamer Chrome extension
    desktopSharingSources: ['screen', 'window'],
    enableCalendarIntegration: true,
    //new desktop sharing settings
    desktopSharingChromeExtId: 'kglhbbefdnlheedjiejgomgmfplipfeb', // Id of desktop streamer Chrome extension
    desktopSharingChromeDisabled: false,
    desktopSharingChromeSources: ['screen', 'window', 'tab'],
    desktopSharingChromeMinExtVersion: '0.2.6.2', // Required version of Chrome extension
    desktopSharingFirefoxExtId: "",
    desktopSharingFirefoxDisabled: false,
    desktopSharingFirefoxMaxVersionExtRequired: '0',
    desktopSharingFirefoxExtensionURL: "",
    useRoomAsSharedDocumentName: false,
    enableLipSync: false,
    disableRtx: false, // Enables RTX everywhere
    enableRtpStats: false, // Enables RTP stats processing
    enableScreenshotCapture: false,
    enableStatsID: true,
    openBridgeChannel: 'websocket', // One of true, 'datachannel', or 'websocket'
    channelLastN: -1, // The default value of the channel attribute last-n.
    minHDHeight: 540,
    startBitrate: "800",
    disableAudioLevels: false,
    useRtcpMux: true,
    useBundle: true,
    disableSuspendVideo: true,
    stereo: false,
    forceJVB121Ratio:  -1,
    enableTalkWhileMuted: true,

    enableNoAudioDetection: true,

    enableNoisyMicDetection: true,

    enableClosePage: true,

    hiddenDomain: 'recorder.beta.meet.jit.si',
    transcribingEnabled: true,
    enableRecording: true,
    liveStreamingEnabled: true,
    fileRecordingsEnabled: true,
    fileRecordingsServiceEnabled: false,
    fileRecordingsServiceSharingEnabled: false,
    requireDisplayName: false,
    recordingType: 'jibri',
    enableWelcomePage: true,
    isBrand: false,
    logStats: false,
    dialInNumbersUrl: 'https://web-cdn.jitsi.net/beta/phoneNumberList.json',
    dialInConfCodeUrl:  'https://api.jitsi.net/conferenceMapper',

    dialOutCodesUrl:  'https://api.jitsi.net/countrycodes',
    dialOutAuthUrl: 'https://api.jitsi.net/authorizephone',
    peopleSearchUrl: 'https://api.jitsi.net/directorySearch',
    inviteServiceUrl: 'https://api.jitsi.net/conferenceInvite',
    inviteServiceCallFlowsUrl: 'https://api.jitsi.net/conferenceinvitecallflows',
    peopleSearchQueryTypes: ['user','conferenceRooms'],
    startAudioMuted: 9,
    startVideoMuted: 9,
    enableUserRolesBasedOnToken: false,
    enableLayerSuspension: false,
    feedbackPercentage: 100,
    hepopAnalyticsUrl: "",
    hepopAnalyticsEvent: {
        product: "lib-jitsi-meet",
        subproduct: "beta-meet-jit-si",
        name: "jitsi.page.load.failed",
        action: "page.load.failed",
        actionSubject: "page.load",
        type: "page.load.failed",
        source: "page.load",
        attributes: {
            type: "operational",
            source: 'page.load'
        },
        server: "beta.meet.jit.si"
    },
    deploymentInfo: {
        environment: 'beta-meet-jit-si',
        envType: 'stage',
        releaseNumber: '700',
        shard: 'beta-eu-west-2b-s5',
        region: 'eu-west-2',
        userRegion: 'eu-west-2',
        crossRegion: (!'eu-west-2' || 'eu-west-2' === 'eu-west-2') ? 0 : 1
    },
    rttMonitor: {
        enabled: false,
        initialDelay: 30000,
        getStatsInterval: 10000,
        analyticsInterval: 60000,
        stunServers: {"us-east-1": "all-us-east-1-turn.jitsi.net:443", "ap-se-2": "all-ap-se-2-turn.jitsi.net:443", "ap-se-1": "all-ap-se-1-turn.jitsi.net:443", "us-west-2": "all-us-west-2-turn.jitsi.net:443", "eu-central-1": "all-eu-central-1-turn.jitsi.net:443", "eu-west-1": "all-eu-west-1-turn.jitsi.net:443"}
    },
    e2eping: {
        pingInterval: -1
    },
    abTesting: {
    },
    testing: {
        capScreenshareBitrate: 1,
        octo: {
            probability: 1
        }
    }
};
