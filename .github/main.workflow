workflow "ci" {
  on = "push"
  resolves = ["build"]
}

action "branch ci" {
  uses = "actions/bin/filter@c6471707d308175c57dfe91963406ef205837dbd"
  args = "branch ci"
}

action "build" {
  uses = "actions/npm@3c8332795d5443adc712d30fa147db61fd520b5a"
  needs = ["branch ci"]
  runs = "yarn"
  args = "run build"
}
