/**
 * Saves/retrieves data to userscript data storage
 * Note the GM.X variant returns Promises
 */
class TamperMonkeyUserDataContext {

  constructor() {
  }

  /**
   * Sets data to the Tampermonkey user store
   * @param {*} key Key
   * @param {*} value Value
   * @returns Promise with no value on success, no value for rejected
   */
  put(key: string, value: any): Promise<any> {
    if (key == null || key == '') {
      throw new Error(`Cannot save with null key. Value=${value}`);
    }
    return GM.setValue(key, value)
  }

  /**
   * Get the value associated for the key
   * @param {*} key Key to fetch
   * @returns Promise
   */
  get(key): Promise<any> {
    return GM.getValue(key);
  }

  /**
   * Deletes a value for the given key
   */
  delete(key): Promise<void> {
    return GM.deleteValue(key);
  }

  /**
   * Gets all keys
   * @returns Promise
   */
  getAllKeys(): Promise<string[]> {
    return GM.listValues();
  }

  /**
   * Gets all values.
   * Optional: provide a key filtering function
   * Otherwise retrieves all values in database
   * @param {Func<string,bool>} keyFilter (Optional) Lambda with param for key and returns bool
   */
  getAllValues(keyFilter): Promise<any> {
    //No filter, return all items
    if (keyFilter == null) {
      keyFilter = (() => true);
    }

    return new Promise(async (resolve, reject) => {
      var getAllKeys = await this.getAllKeys();

      var filteredKeys = getAllKeys.filter(keyFilter);
      var getValueTasks = [];
      filteredKeys.forEach(key => {
        getValueTasks.push(this.get(key));
      });

      var filteredValues = await Promise.all(getValueTasks);
      resolve(filteredValues);
    });
  }
}