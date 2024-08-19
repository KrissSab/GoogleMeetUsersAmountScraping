const { Builder, By, until } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome.js')

class GoogleMeetHelper {
    constructor(chromeDataDirectory, hideBrowser = true) {
        let chromeOptions = new chrome.Options();
        chromeOptions.addArguments("--srart-maximized");
        chromeOptions.addArguments("--no-sandbox");
        chromeOptions.addArguments("--disable-dev-shm-usage");
        if (hideBrowser) {
            chromeOptions.addArguments("--headless");
        }
        chromeOptions.addArguments("--disable-blink-features=AutomationControlled");
        chromeOptions.addArguments(`--user-data-dir=${chromeDataDirectory}/chrome-meeting-data`);
        chromeOptions.addArguments("--profile-directory=GMHelper");
        chromeOptions.addArguments("--silent");
        chromeOptions.addArguments("--log-level=3");
        chromeOptions.addArguments("--disable-logging");
        chromeOptions.addArguments("--disable-crash");
        chromeOptions.excludeSwitches = ["enable-logging"];

        chromeOptions.setUserPreferences({
            "profile.default_content_setting_values.media_stream_mic": 1,
            "profile.default_content_setting_values.media_stream_camera": 1,
            "profile.default_content_setting_values.geolocation": 0,
            "profile.default_content_setting_values.notifications": 1
        })

        this.driver = new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
        this.wait = this.driver.wait;
    }

    async loginAccount() {
        const mailAddress = process.env.EMAIL_ADDRESS
        const password = process.env.EMAIL_PASSWORD

        if (!await this.checkLoginStatus()) {
            try {
                await this.driver.get('https://accounts.google.com/ServiceLogin?hl=en&passive=true&continue=https://www.google.com/&ec=GAZAAQ');
                await this.driver.findElement(By.id('identifierId')).sendKeys(mailAddress);
                await this.driver.findElement(By.id('identifierNext')).click();
                await this.driver.wait(until.elementLocated(By.xpath('//*[@id="password"]/div[1]/div/div[1]/input')), 10000);

                await this.driver.findElement(By.xpath('//*[@id="password"]/div[1]/div/div[1]/input')).sendKeys(password);
                await this.driver.findElement(By.id('passwordNext')).click();
                await this.driver.wait(until.urlContains("https://www.google.com/"), 10000);
            }
            catch {
                throw new Error("GoogleMeetBot Error: Couldn't login!")
            }
        }
    }

    async checkLoginStatus() {
        await this.driver.sleep(2000)
        if (await this.driver.getCurrentUrl() === "chrome://new-tab-page/") {
            return true
        }
        else return false
    }

    async turnOffCameraAndMicro() {
        try {
            await this.driver.wait(until.elementLocated(By.xpath(`/html/body/div[1]/c-wiz/div/div/div[28]/div[3]/div/div[2]/div[4]/div/div/div[1]/div[1]/div/div[7]/div[1]/div/div`)), 10000)
            await this.driver.findElement(By.xpath(`/html/body/div[1]/c-wiz/div/div/div[28]/div[3]/div/div[2]/div[4]/div/div/div[1]/div[1]/div/div[7]/div[1]/div/div`)).click()
            await this.driver.wait(until.elementLocated(By.xpath(`/html/body/div[1]/c-wiz/div/div/div[28]/div[3]/div/div[2]/div[4]/div/div/div[1]/div[1]/div/div[7]/div[2]/div/div[1]`)), 10000)
            await this.driver.findElement(By.xpath(`/html/body/div[1]/c-wiz/div/div/div[28]/div[3]/div/div[2]/div[4]/div/div/div[1]/div[1]/div/div[7]/div[2]/div/div[1]`)).click()
            this.driver.sleep(1000)
        }
        catch {
            throw new Error("GoogleMeetBot Error: Couldn't turn off micro and camera.")
        }
    }

    async askToJoin() {
        try {
            await this.driver.wait(until.elementLocated(By.xpath('/html/body/div[1]/c-wiz/div/div/div[28]/div[3]/div/div[2]/div[4]/div/div/div[2]/div[1]/div[2]/div[1]/div/button')), 10000)
            await this.driver.findElement(By.xpath('/html/body/div[1]/c-wiz/div/div/div[28]/div[3]/div/div[2]/div[4]/div/div/div[2]/div[1]/div[2]/div[1]/div/button')).click();
            await this.driver.wait(until.elementLocated(By.xpath(`/html/body/div[1]/c-wiz/div/div/div[27]/div[3]/div[10]/div/div/div[3]/div/div[2]/div/div/div`)), 60000)
        } catch {
            const error = new Error("GoogleMeetBot Error: Couldn't enter the room or meeting wasn't started.")
            error.status = 475
            throw error
        }
    }

    async stayInMeet() {
        try {
            let timeToLeave = 180;
            await this.driver.sleep(5000)
            while (timeToLeave > 0) {
                const element = await this.driver.findElement(By.xpath(`/html/body/div[1]/c-wiz/div/div/div[27]/div[3]/div[10]/div/div/div[3]/div/div[2]/div/div/div`));
                const text = await element.getText();

                if (+text === 1) {
                    timeToLeave -= 20;
                }

                await this.driver.sleep(20 * 1000);
            }
            return true
        } catch (error) {
            throw new Error("GoogleMeetBot Error: Coulnd't get amount of users.")
        }
        //! Trigger send notifications
        console.log(`Leaving the meet after 3 minute of users awaiting.`);
    }

    async navigateToMeeting(meetingCode) {
        try {
            await this.driver.get(`https://meet.google.com/${meetingCode}`)
        } catch (error) {
            throw new Error("GoogleMeetBot Error: Couldn't navigate to meeting.")
        }
    }

    async shutdownBot() {
        try {
            await this.driver.quit()
        } catch (error) {
            throw new Error("GoogleMeetBot Error: Couldn't shutdown.")
        }
    }
}

module.exports = {
    GoogleMeetHelper
}