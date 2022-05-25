export const startTask = (task, interval, delayed) => {
  if (delayed) {
    setTimeout(() => {
      task();
      setInterval(task, interval);
    }, delayed);
  } else {
    task()
    setInterval(task, interval);
  }
}
