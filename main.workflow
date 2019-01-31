workflow "New workflow" {
  on = "push"
  resolves = [
    "only ci",
    "test",
  ]
}

action "build" {
  uses = "actions/npm@3c8332795d5443adc712d30fa147db61fd520b5a"
  runs = "yarn run build"
  needs = ["only ci"]
}

action "test" {
  uses = "actions/npm@3c8332795d5443adc712d30fa147db61fd520b5a"
  runs = "yarn test"
  needs = ["build"]
}

action "only ci" {
  uses = "actions/bin/filter@c6471707d308175c57dfe91963406ef205837dbd"
  args = "branch ci"
}
