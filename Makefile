mocha		= ./node_modules/mocha/bin/_mocha
istanbul	= ./node_modules/.bin/instanbul

test-cov: clean
	$(istanbul) cover $(mocha) -- -R spec test/*

coveralls:
	cat ./coverage/lcov.info | ./node_modules/coveralls/bin/converalls.js;

clean:
	rm -rf coverage
