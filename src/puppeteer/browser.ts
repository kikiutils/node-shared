import {
	Browser,
	Page,
	WaitForOptions
} from 'puppeteer';

import PuppeteerPage from './page';
import { randomStr } from '../string';

export default class {
	b: Browser;
	pages: {
		[name: string]: PuppeteerPage
	};

	constructor(browser: Browser) {
		this.b = browser;
		this.pages = {};
	}

	_addPage(page: Page, cookieFileName: string, name: string) {
		const puppeteerPage = new PuppeteerPage(page, cookieFileName, name, this);
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
		const tasks = Object.values(this.pages).map((page) => page.close(saveCookies));
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
		const page = (await this.b.pages())[index];

		for (const pageName in this.pages) {
			if (this.pages[pageName].p.url() === page.url()) {
				return this.pages[pageName];
			}
		}

		const newPageName = this._getNewPageName();
		return this._addPage(page, cookieFileName, newPageName);
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

		const page = await this.b.newPage();
		await page.setExtraHTTPHeaders({
			'Accept-Language': 'zh-TW'
		});

		if (url) await page.goto(url, gotoOptions);
		return this._addPage(page, cookieFileName, name);
	}
}
