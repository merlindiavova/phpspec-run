<?php

namespace spec\MerlinDiavova\DevEnv\Phpspec;

use PhpSpec\ObjectBehavior;

class SampleSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(Sample::class);
    }

    public function it_has_a_default_name()
    {
        $this->shouldReturnName('Standard');
    }
}
