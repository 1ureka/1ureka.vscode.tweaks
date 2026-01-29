/** ? */
const sortCollator = new Intl.Collator(undefined, {
  usage: "sort",
  numeric: true,
  sensitivity: "variant",
});

/**
 * 比較兩個字串以進行排序
 */
const sortCompare = (a: string, b: string): number => {
  return sortCollator.compare(a, b);
};

export { sortCompare };
