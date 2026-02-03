function debounce(func, timerAmount) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, timerAmount);
  };
}
function filterData(query, data, type) {
  const tempQuery = query.toLowerCase();
  switch (type) {
    case "student":
      return data.filter((e) => {
        return (
          e.grNo.toString().includes(tempQuery) ||
          e.studentName.toLowerCase().includes(tempQuery)
        );
      });
    case "teacher":
      return data.filter((e) => {
        return (
          e.teacherId.toString().includes(tempQuery) ||
          e.teacherName.toLowerCase().includes(tempQuery)
        );
      });
    case "subject":
      return data.filter((e) => {
        return (
          e.subjectId.toString().includes(tempQuery) ||
          e.subjectName.toLowerCase().includes(tempQuery)
        );
      });
    default:
      return data;
  }
}

export const debouncedFilterData = debounce(
  (query, data, type, setFilterData) => {
    const result = filterData(query, data, type);
    setFilterData(result);
  },
  500
);
