import {
	Browser,
	ElementHandle,
	executablePath,
	Page,
	PuppeteerLaunchOptions,
	WaitForOptions
} from 'puppeteer';

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import { randomStr } from './string';

puppeteer.use(StealthPlugin());

export class PuppeteerBrowser {
	b: Browser;
	pages: {
		[name: string]: PuppeteerPage
	};

	constructor(browser: Browser) {
		this.b = browser;
		this.pages = {};
	}

	_addPage(page: Page, cookieFileName: string, name: string) {
		let puppeteerPage = new PuppeteerPage(page, cookieFileName, name, this);
		this.pages[name] = puppeteerPage;
		return puppeteerPage;
	}

	/**
	 * Get unique page name.
	 */
	_getNewPageName() {
		let name = randomStr();
		while (this.pages[name]) name = randomStr();
		return name;
	}

	/**
	 * Closed page and remove from browser pages.
	 */
	_pageClosed(pageName: string) {
		delete this.pages[pageName];
	}

	/**
	 * Close the browser.
	 */
	async close(saveCookies: boolean = false) {
		let tasks = [];

		for (let pageName in this.pages) {
			tasks.push(this.pages[pageName].close(saveCookies));
		}

		await Promise.all(tasks);
		await this.b.close();
	}

	/**
	 * Get page by name.
	 */
	getPage(name: string) {
		return this.pages[name];
	}

	/**
	 * Get page by pages index.
	 */
	async getPageByIndex(index: number, cookieFileName: string = '') {
		let page = (await this.b.pages())[index];

		for (let pageName in this.pages) {
			if (this.pages[pageName].p.url() === page.url()) {
				return this.pages[pageName];
			}
		}

		let pageName = this._getNewPageName();
		return this._addPage(page, cookieFileName, pageName);
	}

	/**
	 * Get new page.
	 */
	async newPage(
		url: string = '',
		cookieFileName: string = '',
		name: string = '',
		gotoOptions: WaitForOptions = {}
	) {
		if (!name) {
			name = this._getNewPageName();
		} else if (this.pages[name]) {
			throw new Error(`Page name: ${name} already exists!`);
		}

		let page = await this.b.newPage();
		await page.setExtraHTTPHeaders({
			'Accept-Language': 'zh-TW'
		});

		if (url) await page.goto(url, gotoOptions);
		return this._addPage(page, cookieFileName, name);
	}
}

export class PuppeteerPage {
	b: PuppeteerBrowser;
	cookieFileName: string;
	name: string;
	p: Page;

	constructor(
		page: Page,
		cookieFileName: string,
		name: string,
		browser: PuppeteerBrowser
	) {
		this.b = browser;
		this.cookieFileName = cookieFileName;
		this.name = name;
		this.p = page;
	}

	async close(saveCookies: boolean = false) {
		await this.p.close();
		this.b._pageClosed(this.name);
	}
}

export async function getPuppeteerBrowser(
	extraOptions: PuppeteerLaunchOptions = {},
	replaceArgs: boolean = false
) {
	let options: PuppeteerLaunchOptions = {
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
	let browser = await puppeteer.launch(options);
	let puppeteerBrowser = new PuppeteerBrowser(browser);
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
	let element = await el.$(selector);
	if (!element) return undefined;
	return await getElementAttribute(element, attributeName);
}
