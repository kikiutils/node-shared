import {
	ElementHandle,
	executablePath,
	Page,
	PuppeteerLaunchOptions
} from 'puppeteer';

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import PuppeteerBrowser from './browser';

puppeteer.use(StealthPlugin());

export async function getPuppeteerBrowser(
	extraOptions: PuppeteerLaunchOptions = {},
	replaceArgs: boolean = false
) {
	const options: PuppeteerLaunchOptions = {
		args: [
			'--autoplay-policy=no-user-gesture-required',
			'--disable-setuid-sandbox',
			'--disable-blink-features=AutomationControlled',
			'--disable-extensions',
			'--disable-gpu',
			'--disable-infobars',
			'--ignore-certifcate-errors',
			'--ignore-certifcate-errors-spki-list',
			'--no-sandbox',
			'--start-maximized',
			'--use-fake-ui-for-media-stream',
			'--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
		],
		defaultViewport: null,
		dumpio: false,
		executablePath: executablePath(),
		headless: false,
		ignoreDefaultArgs: false,
		ignoreHTTPSErrors: true,
		userDataDir: './.cache/pyppeteer_browsers/main'
	};

	if (!replaceArgs) {
		options.args?.push(...(extraOptions.args || []));
		delete extraOptions.args;
	}

	Object.assign(options, extraOptions);
	const browser = await puppeteer.launch(options);
	const puppeteerBrowser = new PuppeteerBrowser(browser);
	await (await browser.pages())[0].setExtraHTTPHeaders({
		'Accept-Language': 'zh-TW'
	});

	return puppeteerBrowser;
}

export async function getElementAttribute(element: ElementHandle, attributeName: string) {
	return await (await element?.getProperty(attributeName)).jsonValue();
}

export async function getSelectorAttribute(
	el: ElementHandle | Page,
	selector: string,
	attributeName: string
) {
	const element = await el.$(selector);
	if (!element) return undefined;
	return await getElementAttribute(element, attributeName);
}
