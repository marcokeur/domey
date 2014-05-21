import sys

  processList = []

def runScripts():
  processList.append(Popen(['watch', 'ls']))
  processList.append(Popen(['watch', 'df']))
  processList.append(Popen(['watch', 'uptime']))

def main():
    runScripts()

if __name__ == "__main__":
    main()
