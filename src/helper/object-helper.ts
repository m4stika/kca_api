function getKeyFromObject<K extends string>(obj: Record<K, any>): [K, ...K[]] {
  const [firstKey, ...otherKeys] = Object.keys(obj) as K[];
  return [firstKey, ...otherKeys];
}

export default { getKeyFromObject };
