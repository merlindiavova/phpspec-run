<?php

namespace spec\MerlinDiavova\DevEnv\Phpspec\MoreSamples;

use PhpSpec\ObjectBehavior;
use MerlinDiavova\DevEnv\Phpspec\Sample;

class NestedSampleSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(AnotherSample::class);
    }

    public function it_has_a_default_name()
    {
        $this->shouldReturnName('Another Standard');
    }

    public function it_extends_sample()
    {
        $this->shouldHaveType(Sample::class);
    }
}
