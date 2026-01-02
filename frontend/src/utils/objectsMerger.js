export function mergeObjects(originalObj, newObj, keyMap) {
  const updatedObj = { ...originalObj };

  Object.entries(newObj).forEach(([key, value]) => {
    const targetKey = keyMap.get(key) || key;
    if (targetKey in updatedObj) {
      updatedObj[targetKey] = value;
    }
  });

  return updatedObj;
}
