export function timeAgo(timestamp: number, currentTime:number) {
    const differenceInSeconds = currentTime - timestamp;
  
    if (differenceInSeconds < 60) {
      return differenceInSeconds + ' secs ago';
    } else if (differenceInSeconds < 3600) {
      return Math.floor(differenceInSeconds / 60) + ' mins ago';
    } else if (differenceInSeconds < 86400) {
      return Math.floor(differenceInSeconds / 3600) + ' hr ago';
    } else {
      return Math.floor(differenceInSeconds / 86400) + ' days ago';
    }
  }
  