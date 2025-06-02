import { Injectable } from '@angular/core';

//const APP_PREFIX = 'AGN';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  constructor() {}

  static loadInitialState(app_prefix : string) {
    return Object.keys(localStorage).reduce((state: any, storageKey) => {
      if (storageKey.includes(app_prefix)) {
        const stateKeys = storageKey
          .replace(app_prefix, '')
          .toLowerCase()
          .split('.')
          .map(key =>
            key
              .split('-')
              .map((token, index) =>
                index === 0
                  ? token
                  : token.charAt(0).toUpperCase() + token.slice(1)
              )
              .join('')
          );
        let currentStateRef = state;
        stateKeys.forEach((key, index) => {
          if (index === stateKeys.length - 1) {
            currentStateRef[key] = JSON.parse(localStorage.getItem(storageKey));
            return;
          }
          currentStateRef[key] = currentStateRef[key] || {};
          currentStateRef = currentStateRef[key];
        });
      }
      console.log("LOCAL STORAGE KEY : %o",storageKey)
      return state;
    }, {});
  }

  setItem(app_prefix : string ,key: string, value: any) {
    localStorage.setItem(`${app_prefix}${key}`, JSON.stringify(value));
  }

  getItem(app_prefix : string ,key: string) {
    return JSON.parse(localStorage.getItem(`${app_prefix}${key}`));
  }

  removeItem(app_prefix : string ,key: string) {
    localStorage.removeItem(`${app_prefix}${key}`);
  }

  clearStorage(){
    localStorage.clear();
  }

  /** Tests that localStorage exists, can be written to, and read from. */
  // testLocalStorage() {
  //   const testValue = 'testValue';
  //   const testKey = 'testKey';
  //   let retrievedValue: string;
  //   const errorMessage = 'localStorage did not return expected value';

  //   this.setItem(testKey, testValue);
  //   retrievedValue = this.getItem(testKey);
  //   this.removeItem(testKey);

  //   if (retrievedValue !== testValue) {
  //     throw new Error(errorMessage);
  //   }
  // }
}
