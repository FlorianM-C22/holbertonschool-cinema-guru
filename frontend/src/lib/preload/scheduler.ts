/**
 * Run an array of tasks with a concurrency limit. Each task is a function
 * that returns a Promise. Tasks are executed in order, up to `concurrency` at a time.
 */
export async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<void> {
  if (tasks.length === 0) return
  let index = 0
  const runNext = async (): Promise<void> => {
    const i = index++
    if (i >= tasks.length) return
    try {
      await tasks[i]()
    } catch {
      // ignore per-task errors for prefetch
    }
    await runNext()
  }
  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => runNext())
  await Promise.all(workers)
}
