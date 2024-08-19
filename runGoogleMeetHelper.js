const { GoogleMeetHelper } = require("./GoogleMeetHelper")

async function meetingStatusTecker(meetingCode) {
    const chromeDataDirectory = '/googlemeetbotdata';
    const hideBrowser = false;
    const gmHelper = new GoogleMeetHelper(chromeDataDirectory, hideBrowser)
    let meetingStatus = false

    try {
        await gmHelper.loginAccount()
        await gmHelper.navigateToMeeting(meetingCode)
        await gmHelper.turnOffCameraAndMicro()
        await gmHelper.askToJoin()
        meetingStatus = await gmHelper.stayInMeet()

        // return meetingStatus
        console.log(meetingStatus)
    }
    catch (error) {
        if (error.status === 475) {
            console.log(error.message, meetingStatus)
            return meetingStatus
        }
        else {
            console.error(`Unexpected ${error.message}`)
        }
    }
    finally {
        await gmHelper.shutdownBot()
    }
};

meetingStatusTecker("ehy-mtzj-emi")